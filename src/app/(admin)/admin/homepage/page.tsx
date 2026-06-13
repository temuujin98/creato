import { createAdminClient } from '@/server/supabase-admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminHomepageClient from '@/components/admin/AdminHomepageClient'

export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: sections } = await admin
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  return <AdminHomepageClient sections={sections ?? []} />
}
