import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminPackagesClient from '@/components/admin/AdminPackagesClient'

export const dynamic = 'force-dynamic'

export default async function AdminPackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: packages } = await admin
    .from('credit_packages')
    .select('id, name, credits, price_mnt, is_org, sort_order, is_active')
    .order('sort_order', { ascending: true })

  return <AdminPackagesClient packages={packages ?? []} />
}
