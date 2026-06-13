import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, email, role')
    .eq('id', user.id)
    .single()

  console.log('[admin-layout]', { userId: user.id, role: profile?.role, profileError })

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <AdminShell userName={profile?.display_name ?? user.email ?? 'Admin'}>
      {children}
    </AdminShell>
  )
}
