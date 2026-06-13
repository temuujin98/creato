import { createAdminClient } from '@/server/supabase-admin'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, email, role, created_at')
    .order('created_at', { ascending: false })

  const { data: wallets } = await admin
    .from('wallets')
    .select('user_id, balance')

  const walletMap: Record<string, number> = {}
  for (const w of wallets ?? []) {
    walletMap[w.user_id] = w.balance ?? 0
  }

  const rows = (profiles ?? []).map(p => ({
    id: p.id as string,
    name: (p.display_name as string | null) ?? '—',
    email: p.email as string,
    role: p.role as string,
    balance: walletMap[p.id as string] ?? 0,
    createdAt: p.created_at as string,
  }))

  return <AdminUsersClient users={rows} />
}
