import { createAdminClient } from '@/server/supabase-admin'
import AdminPresetsClient from '@/components/admin/AdminPresetsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPresetsPage() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('presets')
    .select('id, slug, name, status, credit_cost, is_featured, primary_model, created_at, categories(name)')
    .order('created_at', { ascending: false })

  const rows = (data ?? []).map(p => ({
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    status: p.status as string,
    creditCost: p.credit_cost as number,
    isFeatured: p.is_featured as boolean,
    primaryModel: p.primary_model as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categoryName: (p as any).categories?.name ?? '—',
    createdAt: p.created_at as string,
  }))

  return <AdminPresetsClient presets={rows} />
}
