import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminCategoriesClient from '@/components/admin/AdminCategoriesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: categories } = await admin
    .from('categories')
    .select('id, name, slug, sort_order, is_active, created_at')
    .order('sort_order', { ascending: true })

  const { data: presetCounts } = await admin
    .from('presets')
    .select('category_id')

  const countMap: Record<string, number> = {}
  for (const p of presetCounts ?? []) {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
  }

  return <AdminCategoriesClient categories={categories ?? []} presetCounts={countMap} />
}
