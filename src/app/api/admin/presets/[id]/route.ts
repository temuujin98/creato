import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/server/supabase-admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return { userId: user.id }
}

// Validate that all [variable] placeholders in base_prompt have a matching field with prompt_mapping
function validatePromptFields(
  basePrompt: string,
  fields: Array<{ field_key: string; prompt_mapping: string | null; is_active: boolean }>
): string | null {
  if (!basePrompt) return null
  const varRegex = /\[([a-z0-9_]+)\]/gi
  const matches = [...basePrompt.matchAll(varRegex)]
  const varKeys = [...new Set(matches.map(m => m[1].toLowerCase()))]
  for (const key of varKeys) {
    const field = fields.find(
      f => f.field_key === key && f.is_active && f.prompt_mapping
    )
    if (!field) {
      return `Variable [${key}] нь base_prompt-д байгаа ч тохирох field тохиргоо алга`
    }
  }
  return null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if (!auth) return NextResponse.json({ error: 'Зөвшөөрөлгүй' }, { status: 403 })

  const { id } = await params
  if (id === 'new') {
    return NextResponse.json({ preset: null, fields: [] })
  }

  const admin = createAdminClient()

  const { data: preset, error: presetErr } = await admin
    .from('presets')
    .select('*')
    .eq('id', id)
    .single()

  if (presetErr || !preset) {
    return NextResponse.json({ error: 'Preset олдсонгүй' }, { status: 404 })
  }

  const { data: fields, error: fieldsErr } = await admin
    .from('preset_fields')
    .select('*')
    .eq('preset_id', id)
    .order('sort_order')

  if (fieldsErr) {
    return NextResponse.json({ error: 'Fields уншихад алдаа гарлаа' }, { status: 500 })
  }

  return NextResponse.json({ preset, fields: fields ?? [] })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if (!auth) return NextResponse.json({ error: 'Зөвшөөрөлгүй' }, { status: 403 })

  const { id } = await params

  let body: {
    preset: Record<string, unknown>
    fields: Array<{
      id?: string
      field_key: string
      label: string
      input_type: string
      required: boolean
      placeholder?: string
      help_text?: string
      default_value?: string
      choices?: unknown
      prompt_mapping?: string
      sort_order: number
      is_active: boolean
    }>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Буруу хүсэлт' }, { status: 400 })
  }

  const { preset: presetData, fields } = body

  // Basic validation
  if (!presetData.name) {
    return NextResponse.json({ error: 'Нэр шаардлагатай' }, { status: 422 })
  }
  if (!presetData.slug) {
    return NextResponse.json({ error: 'Slug шаардлагатай' }, { status: 422 })
  }

  // If status=active, validate prompt variables have matching fields
  if (presetData.status === 'active' && presetData.base_prompt) {
    const validationError = validatePromptFields(
      presetData.base_prompt as string,
      fields.map(f => ({
        field_key: f.field_key,
        prompt_mapping: f.prompt_mapping ?? null,
        is_active: f.is_active,
      }))
    )
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 })
    }
  }

  const admin = createAdminClient()
  const isNew = id === 'new'

  // Strip client-side-only fields that don't exist in DB
  const dbPreset = { ...presetData }
  delete dbPreset.id
  delete dbPreset.created_at
  dbPreset.updated_at = new Date().toISOString()

  let savedId: string

  if (isNew) {
    const { data: created, error: insertErr } = await admin
      .from('presets')
      .insert(dbPreset)
      .select('id')
      .single()

    if (insertErr || !created) {
      return NextResponse.json({ error: insertErr?.message ?? 'INSERT алдаа' }, { status: 500 })
    }
    savedId = created.id
  } else {
    const { error: updateErr } = await admin
      .from('presets')
      .update(dbPreset)
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }
    savedId = id
  }

  // Sync preset_fields
  // 1. Get existing field ids for this preset
  const { data: existingFields } = await admin
    .from('preset_fields')
    .select('id')
    .eq('preset_id', savedId)

  const existingIds = new Set((existingFields ?? []).map(f => f.id as string))
  const incomingIds = new Set(fields.filter(f => f.id).map(f => f.id as string))

  // 2. Delete fields not in payload
  const toDelete = [...existingIds].filter(eid => !incomingIds.has(eid))
  if (toDelete.length > 0) {
    await admin.from('preset_fields').delete().in('id', toDelete)
  }

  // 3. Upsert each field
  for (const field of fields) {
    const fieldData = {
      preset_id: savedId,
      field_key: field.field_key,
      label: field.label,
      input_type: field.input_type,
      required: field.required,
      placeholder: field.placeholder ?? null,
      help_text: field.help_text ?? null,
      default_value: field.default_value ?? null,
      choices: field.choices ?? null,
      prompt_mapping: field.prompt_mapping ?? null,
      sort_order: field.sort_order,
      is_active: field.is_active,
    }

    if (field.id && existingIds.has(field.id)) {
      await admin.from('preset_fields').update(fieldData).eq('id', field.id)
    } else {
      await admin.from('preset_fields').insert(fieldData)
    }
  }

  return NextResponse.json({ ok: true, id: savedId })
}

// POST for /api/admin/presets/new — same as PUT with id='new'
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Reuse PUT logic by forwarding
  return PUT(req, { params })
}
