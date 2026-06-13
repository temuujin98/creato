import { createAdminClient } from '@/server/supabase-admin'
import PresetEditorClient from '@/components/admin/PresetEditorClient'
import type { PresetRow, FieldRow, Category } from '@/components/admin/PresetEditorClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PresetEditorPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  // Load categories
  const { data: categoriesRaw } = await admin
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const categories: Category[] = (categoriesRaw ?? []).map(c => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
  }))

  if (id === 'new') {
    return (
      <PresetEditorClient
        id="new"
        preset={null}
        fields={[]}
        categories={categories}
      />
    )
  }

  // Try to load by ID first, then by slug
  let preset: PresetRow | null = null
  let fields: FieldRow[] = []

  const { data: byId } = await admin
    .from('presets')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (byId) {
    preset = byId as unknown as PresetRow
  } else {
    // Try slug
    const { data: bySlug } = await admin
      .from('presets')
      .select('*')
      .eq('slug', id)
      .maybeSingle()
    if (bySlug) {
      preset = bySlug as unknown as PresetRow
    }
  }

  if (preset) {
    const { data: fieldsRaw } = await admin
      .from('preset_fields')
      .select('*')
      .eq('preset_id', preset.id)
      .order('sort_order')
    fields = (fieldsRaw ?? []) as unknown as FieldRow[]
  }

  return (
    <PresetEditorClient
      id={preset?.id ?? id}
      preset={preset}
      fields={fields}
      categories={categories}
    />
  )
}
