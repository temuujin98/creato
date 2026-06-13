import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLogsClient from '@/components/admin/AdminLogsClient'

export const dynamic = 'force-dynamic'

export default async function AdminLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: logs } = await admin
    .from('admin_audit_logs')
    .select('id, admin_id, action, target_table, target_id, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const adminIds = [...new Set((logs ?? []).map(l => l.admin_id))]
  const { data: admins } = await admin
    .from('profiles')
    .select('id, display_name, email')
    .in('id', adminIds.length > 0 ? adminIds : ['00000000-0000-0000-0000-000000000000'])

  const adminMap: Record<string, string> = {}
  for (const a of admins ?? []) {
    adminMap[a.id] = a.display_name ?? a.email ?? a.id
  }

  return <AdminLogsClient logs={logs ?? []} adminMap={adminMap} />
}
