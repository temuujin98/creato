import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminPaymentsClient from '@/components/admin/AdminPaymentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: payments } = await admin
    .from('payments')
    .select('id, user_id, package_id, amount_mnt, provider, status, created_at, paid_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = [...new Set((payments ?? []).map(p => p.user_id))]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, email')
    .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const userMap: Record<string, string> = {}
  for (const p of profiles ?? []) userMap[p.id] = p.display_name ?? p.email ?? p.id

  return <AdminPaymentsClient payments={payments ?? []} userMap={userMap} />
}
