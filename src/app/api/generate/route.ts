import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/server/supabase-admin'
import { buildPrompt } from '@/server/prompt'
import { runWithRetry } from '@/server/providers'
import { checkRateLimit } from '@/server/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

// Whitelisted response shape — nothing server-only leaves this function
function safeResponse(data: {
  id: string
  status: string
  outputSignedUrls: string[]
  creditCost: number
}) {
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  // 2. Rate limit
  const rl = checkRateLimit(user.id)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Хэт олон хүсэлт. Түр хүлээнэ үү.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    )
  }

  // 3. Parse body
  let body: { presetSlug: string; userInputs: Record<string, string>; selectedSize: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Буруу хүсэлт' }, { status: 400 })
  }
  const { presetSlug, userInputs = {}, selectedSize = '1:1' } = body
  if (!presetSlug) {
    return NextResponse.json({ error: 'presetSlug шаардлагатай' }, { status: 400 })
  }

  // 4. Load preset + fields with ALL server-only columns (admin client, base table)
  const admin = createAdminClient()

  type PresetRow = {
    id: string
    slug: string
    credit_cost: number
    status: string
    requires_image: boolean
    min_image_count: number
    max_image_count: number
    allowed_sizes: string[]
    output_count: number
    retry_limit: number
    base_prompt: string | null
    negative_prompt: string | null
    prompt_suffix: string | null
    quality_prompt: string | null
    primary_provider: string
    primary_model: string | null
    fallback_provider: string | null
    fallback_model: string | null
  }

  const { data: presetRaw, error: presetErr } = await admin
    .from('presets')
    .select(
      'id, slug, credit_cost, status, requires_image, min_image_count, max_image_count,' +
      'allowed_sizes, output_count, retry_limit,' +
      'base_prompt, negative_prompt, prompt_suffix, quality_prompt,' +
      'primary_provider, primary_model, fallback_provider, fallback_model'
    )
    .eq('slug', presetSlug)
    .eq('status', 'active')
    .single()

  if (presetErr || !presetRaw) {
    return NextResponse.json({ error: 'Preset олдсонгүй' }, { status: 404 })
  }
  const preset = presetRaw as unknown as PresetRow

  type FieldRow = {
    field_key: string
    prompt_mapping: string | null
    required: boolean
    input_type: string
    is_active: boolean
  }

  const { data: fieldsRaw, error: fieldsErr } = await admin
    .from('preset_fields')
    .select('field_key, prompt_mapping, required, input_type, is_active')
    .eq('preset_id', preset.id)
    .eq('is_active', true)
    .order('sort_order')
  const fields = (fieldsRaw ?? []) as unknown as FieldRow[]

  if (fieldsErr) {
    return NextResponse.json({ error: 'Preset fields уншихад алдаа гарлаа' }, { status: 500 })
  }

  // 5. Validate selected size
  if (!preset.allowed_sizes.includes(selectedSize)) {
    return NextResponse.json({ error: 'Зөвшөөрөгдөөгүй хэмжээ' }, { status: 400 })
  }

  // 6. Validate required fields via buildPrompt (throws on missing required)
  let compiledPrompt: string
  let negativePrompt: string | null
  try {
    const built = buildPrompt(
      {
        base_prompt: preset.base_prompt ?? '',
        negative_prompt: preset.negative_prompt,
        prompt_suffix: preset.prompt_suffix,
        quality_prompt: preset.quality_prompt,
      },
      fields.map((f) => ({
        field_key: f.field_key,
        prompt_mapping: f.prompt_mapping,
        required: f.required,
      })),
      userInputs
    )
    compiledPrompt = built.compiledPrompt
    negativePrompt = built.negativePrompt
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.startsWith('required_field_missing:')) {
      const key = msg.split(':')[1]
      return NextResponse.json({ error: `Заавал талбар дутуу: ${key}` }, { status: 422 })
    }
    return NextResponse.json({ error: 'Prompt бэлтгэхэд алдаа гарлаа' }, { status: 500 })
  }

  // 7. Create generation row status='processing' — compiled_prompt stored server-side only
  const { data: generation, error: genCreateErr } = await admin
    .from('generations')
    .insert({
      user_id: user.id,
      preset_id: preset.id,
      status: 'processing',
      user_inputs: userInputs,
      selected_size: selectedSize,
      output_count: preset.output_count,
      credit_cost: preset.credit_cost,
      compiled_prompt: compiledPrompt, // server-only column
    })
    .select('id')
    .single()

  if (genCreateErr || !generation) {
    return NextResponse.json({ error: 'Generation үүсгэхэд алдаа гарлаа' }, { status: 500 })
  }
  const generationId = generation.id

  // 8. Reserve credits (service role RPC)
  try {
    const { error: reserveErr } = await admin.rpc('reserve_credits', {
      p_user: user.id,
      p_amount: preset.credit_cost,
      p_generation: generationId,
    })
    if (reserveErr) throw new Error(reserveErr.message)
  } catch (err: unknown) {
    // Clean up generation row
    await admin.from('generations').delete().eq('id', generationId)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('insufficient_credits')) {
      return NextResponse.json({ error: 'Credit хүрэлцэхгүй байна' }, { status: 402 })
    }
    return NextResponse.json({ error: 'Credit хадгалахад алдаа гарлаа' }, { status: 500 })
  }

  // 9. Run provider (retry + fallback)
  let providerResult: Awaited<ReturnType<typeof runWithRetry>>
  try {
    providerResult = await runWithRetry({
      prompt: compiledPrompt,
      negativePrompt,
      primaryProvider: preset.primary_provider,
      primaryModel: preset.primary_model ?? '',
      fallbackProvider: preset.fallback_provider ?? null,
      fallbackModel: preset.fallback_model ?? null,
      retryLimit: preset.retry_limit ?? 1,
      size: selectedSize,
      outputCount: preset.output_count,
    })
  } catch (err) {
    // All providers failed → refund
    const errMsg = err instanceof Error ? err.message : 'provider_error'
    // attempt_count: runWithRetry throws after exhausting retryLimit+1 + 1 fallback
    const failedAttempts = (preset.retry_limit ?? 1) + 2
    await admin
      .from('generations')
      .update({ status: 'failed', error_message: errMsg, attempt_count: failedAttempts })
      .eq('id', generationId)
    await admin.rpc('refund_credits', { p_generation: generationId })
    // Return generic error — do NOT expose errMsg to client
    return NextResponse.json({ error: 'Зураг үүсгэхэд алдаа гарлаа. Credit буцаагдлаа.' }, { status: 500 })
  }

  // 10. Upload images to outputs bucket
  const outputPaths: string[] = []
  try {
    for (let i = 0; i < providerResult.images.length; i++) {
      const path = `${user.id}/${generationId}/${i}.png`
      const { error: uploadErr } = await admin.storage
        .from('outputs')
        .upload(path, providerResult.images[i], {
          contentType: 'image/png',
          upsert: false,
        })
      if (uploadErr) throw new Error(uploadErr.message)
      outputPaths.push(path)
    }
  } catch (err) {
    // Storage upload failed → refund
    const errMsg = err instanceof Error ? err.message : 'storage_error'
    await admin
      .from('generations')
      .update({ status: 'failed', error_message: errMsg })
      .eq('id', generationId)
    await admin.rpc('refund_credits', { p_generation: generationId })
    return NextResponse.json({ error: 'Зураг хадгалахад алдаа гарлаа. Credit буцаагдлаа.' }, { status: 500 })
  }

  // 11. Mark completed + spend credits
  await admin
    .from('generations')
    .update({
      status: 'completed',
      output_paths: outputPaths,
      completed_at: new Date().toISOString(),
      attempt_count: providerResult.attemptCount,
      provider_used: providerResult.providerUsed, // server-only column
      model_used: providerResult.modelUsed,         // server-only column
    })
    .eq('id', generationId)

  await admin.rpc('spend_credits', { p_generation: generationId })

  // 12. Generate signed URLs for immediate use
  const signedUrls: string[] = []
  for (const path of outputPaths) {
    const { data: signed } = await admin.storage
      .from('outputs')
      .createSignedUrl(path, 3600) // 1 hour
    if (signed?.signedUrl) signedUrls.push(signed.signedUrl)
  }

  // 13. Bust /my-images cache so next navigation shows the new generation immediately
  revalidatePath('/my-images')

  // 14. Whitelist response — no server-only fields
  return safeResponse({
    id: generationId,
    status: 'completed',
    outputSignedUrls: signedUrls,
    creditCost: preset.credit_cost,
  })
}
