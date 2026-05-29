#!/usr/bin/env node
/**
 * scripts/test-gemini-generation.mjs
 *
 * Controlled Gemini image-generation test. Server/local dev only.
 * NEVER runs in the browser. GEMINI_API_KEY is read from the local
 * environment ONLY and is never written to any src/ file.
 *
 * Usage (run once manually):
 *   ENABLE_GEMINI_TEST_GENERATION=true \
 *   GEMINI_API_KEY=your_key_here \
 *   node scripts/test-gemini-generation.mjs
 *
 * Optional Supabase DB integration (writes completed generation + output
 * record so the result appears in /my-images):
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=service_role_key_here \
 *   SUPABASE_TEST_USER_ID=your_user_uuid \
 *   SUPABASE_TEST_PRODUCT_ID=any_product_uuid \
 *   node scripts/test-gemini-generation.mjs
 *
 * Set ENABLE_GEMINI_TEST_GENERATION=false (or unset it) when finished.
 */

import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Safety guards ─────────────────────────────────────────────────────────────

const TEST_ENABLED = process.env.ENABLE_GEMINI_TEST_GENERATION === "true";
const API_KEY = process.env.GEMINI_API_KEY;

// Detect accidental exposure of the key as a Vite/browser env var.
if (process.env.VITE_GEMINI_API_KEY) {
  process.stderr.write(
    "[gemini-test] SECURITY ERROR: VITE_GEMINI_API_KEY is set.\n" +
      "  This variable name bundles values into the browser. Remove it immediately.\n",
  );
  process.exit(1);
}

if (!TEST_ENABLED) {
  process.stdout.write(
    "[gemini-test] BLOCKED: ENABLE_GEMINI_TEST_GENERATION is not 'true'.\n" +
      "[gemini-test] This block is intentional — real AI generation is off by default.\n" +
      "[gemini-test] To run: ENABLE_GEMINI_TEST_GENERATION=true GEMINI_API_KEY=... node scripts/test-gemini-generation.mjs\n",
  );
  process.exit(0);
}

if (!API_KEY) {
  process.stderr.write(
    "[gemini-test] ERROR: GEMINI_API_KEY is required but not set.\n" +
      "[gemini-test] Set it in your local terminal session only — never in .env.local or any src/ file.\n",
  );
  process.exit(1);
}

// ── Configuration ─────────────────────────────────────────────────────────────

// Default matches the model_configs.primary_model stored in DB for clean-studio-product-shot.
// Override with GEMINI_TEST_MODEL if the Gemini API requires a different alias.
const MODEL = process.env.GEMINI_TEST_MODEL ?? "gemini-2.5-flash-image";
const OUTPUT_COUNT = 1; // Hard-coded to 1 — no loop allowed.

// Optional: path to a local image file to include as inline_data in the request.
// This reproduces the Edge Function request shape for image-required presets like
// clean-studio-product-shot (requiresImage: true).
// Example:
//   GEMINI_TEST_IMAGE_PATH=scripts/test-output/my-product-photo.jpg node scripts/test-gemini-generation.mjs
const IMAGE_PATH = process.env.GEMINI_TEST_IMAGE_PATH ?? null;

const TEST_PROMPT =
  "Create a clean premium studio product photo of a modern white ceramic coffee cup" +
  " on a dark luxury gradient background, soft reflection, professional lighting," +
  " no text, no logo, no watermark.";

// Gemini generateContent endpoint — model path normalisation matches geminiProvider.ts.
const modelPath = MODEL.startsWith("models/") ? MODEL : `models/${MODEL}`;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${API_KEY}`;

const OUTPUT_DIR = join(__dirname, "test-output");

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`[gemini-test] ${msg}\n`);
}

function err(msg) {
  process.stderr.write(`[gemini-test] ERROR: ${msg}\n`);
}

function base64ToBuffer(base64) {
  return Buffer.from(base64, "base64");
}

function safeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// ── Gemini call ───────────────────────────────────────────────────────────────

function loadImagePart() {
  if (!IMAGE_PATH) return null;

  const absPath = join(__dirname, "..", IMAGE_PATH.replace(/^\//, ""));
  if (!existsSync(absPath)) {
    err(`Image file not found: ${absPath}`);
    process.exit(1);
  }

  const ext = extname(IMAGE_PATH).toLowerCase();
  const mimeType =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : null;

  if (!mimeType) {
    err(`Unsupported image type: ${ext}. Use .jpg, .png, or .webp`);
    process.exit(1);
  }

  const bytes = readFileSync(absPath);
  const base64 = bytes.toString("base64");
  log(`  Image input: ${IMAGE_PATH} (${Math.round(bytes.length / 1024)} KB, ${mimeType})`);

  return { inline_data: { data: base64, mime_type: mimeType } };
}

async function callGemini() {
  const imagePart = loadImagePart();
  const parts = [{ text: TEST_PROMPT }];
  if (imagePart) parts.push(imagePart);

  if (imagePart) {
    log("  Mode: text + image input (matches Edge Function request shape for image-required presets)");
  } else {
    log("  Mode: text-only (set GEMINI_TEST_IMAGE_PATH=<file> to include image input)");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000); // 90 s hard cap

  let response;
  const startMs = Date.now();

  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          candidateCount: OUTPUT_COUNT,
          responseModalities: ["IMAGE"],
        },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      err("Request timed out after 90 seconds.");
    } else {
      err(`Network error: ${e instanceof Error ? e.message : String(e)}`);
    }
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }

  const latencyMs = Date.now() - startMs;

  if (!response.ok) {
    let body = {};
    try { body = await response.json(); } catch { /* ignore */ }
    const providerStatus = body.error?.status ?? "";
    const providerMsg = (body.error?.message ?? "").slice(0, 200);
    const details = body.error?.details ?? [];
    const quotaReason = details.find((d) => d.reason)?.reason ?? null;
    const quotaMetric = details.find((d) => d.metadata?.quota_metric)?.metadata?.quota_metric ?? null;
    const quotaId = details.find((d) => d.metadata?.quota_id)?.metadata?.quota_id ?? null;

    err(`Gemini request failed (HTTP ${response.status}).`);
    err(`  providerStatus : ${providerStatus || "(none)"}`);
    err(`  providerMessage: ${providerMsg || "(none)"}`);
    if (quotaReason) err(`  quotaReason    : ${quotaReason}`);
    if (quotaMetric) err(`  quotaMetric    : ${quotaMetric}`);
    if (quotaId)     err(`  quotaId        : ${quotaId}`);

    if (response.status === 429) {
      err("  → Rate limit or quota exhausted. Check Gemini console for quota type.");
    } else if (response.status === 401 || response.status === 403) {
      err("  → Authentication failed — check GEMINI_API_KEY.");
    } else if (response.status === 400) {
      err("  → Invalid request — check model name, input format, or responseModalities.");
    } else if (response.status === 404) {
      err("  → Model not found. Verify GEMINI_TEST_MODEL is a valid image-generation model.");
    }
    process.exit(1);
  }

  const payload = await response.json();

  const blockReason =
    payload.promptFeedback?.blockReason ?? payload.promptFeedback?.block_reason;
  if (blockReason) {
    err(`Gemini blocked the request (safety filter: ${blockReason}).`);
    process.exit(1);
  }

  const outputs = [];
  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) {
        outputs.push({
          base64: inline.data,
          mimeType: inline.mimeType ?? inline.mime_type ?? "image/png",
        });
      }
    }
  }

  if (outputs.length === 0) {
    err("Gemini returned no image outputs. Model may not support image generation.");
    err(`Model used: ${MODEL}`);
    process.exit(1);
  }

  return { latencyMs, outputs };
}

// ── Local file save ───────────────────────────────────────────────────────────

async function saveLocally(outputs) {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ts = safeTimestamp();
  const savedPaths = [];

  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
    const ext = output.mimeType.includes("png") ? "png" : "jpg";
    const filename = `gemini-test-${ts}-${i}.${ext}`;
    const filepath = join(OUTPUT_DIR, filename);

    await writeFile(filepath, base64ToBuffer(output.base64));

    const sizeKb = Math.round(base64ToBuffer(output.base64).length / 1024);
    log(`  Saved: ${filepath} (${sizeKb} KB, ${output.mimeType})`);
    savedPaths.push({ filepath, sizeKb, mimeType: output.mimeType });
  }

  return savedPaths;
}

// ── Optional Supabase DB integration ──────────────────────────────────────────
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_TEST_USER_ID
// + SUPABASE_TEST_PRODUCT_ID.
//
// Creates a generation record (status: completed, credit_cost: 0, test mode)
// and uploads the output to the generation-outputs storage bucket so the
// result appears in /my-images under Phase 21A semantics.

async function trySupabaseIntegration(output, latencyMs) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testUserId = process.env.SUPABASE_TEST_USER_ID;
  const testProductId = process.env.SUPABASE_TEST_PRODUCT_ID;

  if (!supabaseUrl || !serviceRoleKey || !testUserId || !testProductId) {
    log(
      "Supabase DB integration skipped.\n" +
        "[gemini-test]   Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_TEST_USER_ID,\n" +
        "[gemini-test]   SUPABASE_TEST_PRODUCT_ID to enable it.",
    );
    return;
  }

  log("Attempting Supabase DB integration...");

  const restHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // 1. Create generation record (completed, credit_cost=0, test mode).
  const genRes = await fetch(`${supabaseUrl}/rest/v1/generations`, {
    method: "POST",
    headers: restHeaders,
    body: JSON.stringify({
      completed_at: new Date().toISOString(),
      credit_cost: 0, // Test mode — no wallet charge.
      metadata: {
        gemini_test: true,
        latencyMs,
        model: MODEL,
        outputCount: 1,
        source: "test_script",
        testTimestamp: new Date().toISOString(),
      },
      product_id: testProductId,
      status: "completed",
      user_id: testUserId,
    }),
  });

  if (!genRes.ok) {
    err(`Could not create generation record (HTTP ${genRes.status}).`);
    log("Check service role key and that the product UUID exists.");
    return;
  }

  const genData = await genRes.json();
  const generationId = genData[0]?.id;

  if (!generationId) {
    err("Generation record created but ID not returned. Check Supabase RLS.");
    return;
  }

  log(`  Generation record: ${generationId} (status: completed, credit_cost: 0)`);

  // 2. Upload output to generation-outputs storage bucket.
  const storagePath = `users/${testUserId}/generations/${generationId}/outputs/0.png`;
  const imageBytes = base64ToBuffer(output.base64);

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/generation-outputs/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": output.mimeType || "image/png",
        "x-upsert": "true",
      },
      body: imageBytes,
    },
  );

  if (!uploadRes.ok) {
    err(`Storage upload failed (HTTP ${uploadRes.status}).`);
    return;
  }

  log(`  Storage: generation-outputs/${storagePath}`);

  // 3. Insert generation_outputs row.
  const outRes = await fetch(`${supabaseUrl}/rest/v1/generation_outputs`, {
    method: "POST",
    headers: restHeaders,
    body: JSON.stringify({
      generation_id: generationId,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: MODEL,
        outputIndex: 0,
        provider: "gemini",
        source: "test_script",
      },
      output_type: "image",
      storage_path: storagePath,
    }),
  });

  if (!outRes.ok) {
    err(`Could not create generation_outputs row (HTTP ${outRes.status}).`);
    return;
  }

  log("  generation_outputs row: created");
  log("");
  log("Supabase DB integration: SUCCESS");
  log(`  Generation ID : ${generationId}`);
  log(`  Storage path  : ${storagePath}`);
  log(`  Open /my-images — the completed output should appear in the gallery.`);
  log(`  Download from the detail modal to verify signed URL works.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log("─────────────────────────────────────────────────────");
  log("Controlled Gemini image-generation test");
  log(`  Model : ${MODEL}`);
  log(`  Output: ${OUTPUT_COUNT} image`);
  log("─────────────────────────────────────────────────────");
  log("Calling Gemini (one call only)...");

  const { latencyMs, outputs } = await callGemini();

  log(`Response: ${outputs.length} image(s) received in ${latencyMs}ms`);
  log("Saving output locally...");

  const savedPaths = await saveLocally(outputs);

  log("");
  log("─────────────────────────────────────────────────────");
  log("Result: SUCCESS");
  log(`  Model   : ${MODEL}`);
  log(`  Latency : ${latencyMs}ms`);
  log(`  Outputs : ${savedPaths.length}`);
  for (const { filepath, sizeKb } of savedPaths) {
    log(`    → ${filepath} (${sizeKb} KB)`);
  }
  log("─────────────────────────────────────────────────────");
  log("");

  await trySupabaseIntegration(outputs[0], latencyMs);

  log("");
  log("─────────────────────────────────────────────────────");
  log("Next steps:");
  log("  1. Review the saved output file(s) in scripts/test-output/.");
  log("  2. Unset ENABLE_GEMINI_TEST_GENERATION when done.");
  log("  3. Production path: deploy Edge Function with ENABLE_REAL_AI_GENERATION=true");
  log("     and GEMINI_API_KEY set as a Supabase Edge Function secret.");
  log("     That path handles prompt compilation, wallet settlement, and");
  log("     full ownership-checked signed URL access from /my-images.");
  log("─────────────────────────────────────────────────────");
}

main().catch((e) => {
  err(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
