# Gemini Billing and Test Mode

## Overview

Gemini image generation is usage-based. Costs accumulate per API call. A single
unguarded test loop can create unexpected charges. This document defines the
safe operating procedure for all Gemini-related testing in creato.

## Billing Model

- Gemini API calls are billed per request on the paid tier.
- The free tier has strict rate limits and may return `provider_rate_limit` errors.
- A Google Cloud billing account is required before paid-tier testing begins.
- Billing must be monitored at:
  `https://console.cloud.google.com/billing`

## Default State: Real AI Disabled

The Edge Function `process-generation` checks for the environment variable:

```
ENABLE_REAL_AI_GENERATION=true
```

If the variable is missing, empty, or any value other than the exact string `true`,
the function returns:

```json
{ "ok": false, "status": "real_ai_disabled", "dryRun": true }
```

Reserved credits are refunded automatically. No Gemini API call is made.

**This is the correct default for all development, CI, and staging work.**

## When to Enable Real AI

Enable real AI generation only for deliberate, one-at-a-time integration tests.
Never enable it for normal development, UI iteration, or automated test runs.

Required before enabling:
- [ ] Wallet balance is sufficient for the test credit cost.
- [ ] Active `prompt_versions` row exists for the target preset.
- [ ] Active `model_configs` row exists with a valid `public_option_id`.
- [ ] `model_option` mapping is confirmed (fast / premium).
- [ ] `user-uploads` bucket exists and upload RLS is verified.
- [ ] `generation-outputs` bucket exists with correct RLS.
- [ ] `GEMINI_API_KEY` is set as an Edge Function secret (not a frontend env var).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set as an Edge Function secret only.
- [ ] Google Cloud budget alert is configured.
- [ ] Team is aware a real call will be made.

## Procedure: One Controlled Test

```bash
# 1. Confirm everything in the checklist above is complete.

# 2. Enable real AI generation.
supabase secrets set ENABLE_REAL_AI_GENERATION=true

# 3. Deploy the Edge Function to pick up the new secret.
supabase functions deploy process-generation

# 4. Run exactly one generation from the UI or via a direct function call.
#    Use a low-credit preset (fast, 1 credit) with a simple test image.

# 5. Immediately disable real AI generation.
supabase secrets set ENABLE_REAL_AI_GENERATION=false
supabase functions deploy process-generation

# 6. Verify results in the database:
#    - generations.status = 'completed' or 'failed'
#    - wallet_transactions: reserve + spend (or refund)
#    - generation_outputs row exists if completed
#    - output is accessible via signed URL
```

## After the Test

- Set `ENABLE_REAL_AI_GENERATION=false` and redeploy immediately.
- Check Google Cloud billing dashboard for the charge.
- Document the result in `project-docs/06-ops/ai-generation-test-checklist.md`.
- If the test failed with `provider_auth_error`, verify `GEMINI_API_KEY` is set correctly.
- If the test failed with `provider_rate_limit`, wait and retry once on the paid tier.

## What Never Changes

- `GEMINI_API_KEY` is never stored in the frontend `.env` or `VITE_` prefixed variables.
- `SUPABASE_SERVICE_ROLE_KEY` is never stored in the frontend.
- No AI provider keys appear in browser source, network responses, or public API endpoints.
- The `process-generation` function does not return prompts, provider config, or storage paths.

## Frontend Behavior When Real AI Is Disabled

The frontend shows a user-safe message:

> MN: Бодит AI generation одоогоор cost safety горимоор унтраалттай байна. Credit буцаагдсан.
> EN: Real AI generation is currently disabled for cost safety. Credits have been refunded.

No technical details (environment variable names, provider names, model IDs) are
exposed to the end user. Admin monitoring is the only surface that surfaces these details.

## Related Documents

- [`ai-generation-test-checklist.md`](./ai-generation-test-checklist.md) — full preflight checklist
- [`../03-architecture/gemini-adapter-implementation-spec.md`](../03-architecture/gemini-adapter-implementation-spec.md) — Gemini adapter spec
- [`../03-architecture/generation-error-retry-fallback.md`](../03-architecture/generation-error-retry-fallback.md) — error classification and retry rules
- [`../04-data/generation-lifecycle.md`](../04-data/generation-lifecycle.md) — generation state machine
