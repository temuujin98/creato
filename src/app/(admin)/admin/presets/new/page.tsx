import { createAdminClient } from '@/server/supabase-admin'
import PresetEditorClient from '@/components/admin/PresetEditorClient'
import type { Category } from '@/components/admin/PresetEditorClient'

export const dynamic = 'force-dynamic'

export default async function NewPresetPage() {
  const admin = createAdminClient()

  const { data: categoriesRaw } = await admin
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const categories: Category[] = (categoriesRaw ?? []).map(c => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
  }))

  return (
    <PresetEditorClient
      id="new"
      preset={null}
      fields={[]}
      categories={categories}
    />
  )
}
