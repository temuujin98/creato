import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientShell from '@/components/client/ClientShell'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  const balance = wallet?.balance ?? 0

  return (
    <ClientShell balance={balance}>
      {children}
    </ClientShell>
  )
}
