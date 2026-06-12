import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main style={{ fontFamily: "'Roboto', sans-serif", background: '#05050A', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Тавтай морил 👋</h1>
      <p style={{ color: '#A1A1AA', marginTop: 8 }}>{user.email}</p>
      <p style={{ color: '#52525B', marginTop: 4, fontSize: 13 }}>Dashboard — Phase 3-д хийгдэнэ</p>
    </main>
  )
}
