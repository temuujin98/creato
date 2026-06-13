import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminWalletClient from '@/components/admin/AdminWalletClient'

export const dynamic = 'force-dynamic'

export default async function AdminWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, email')
    .order('display_name')

  return <AdminWalletClient profiles={profiles ?? []} />
}
