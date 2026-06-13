import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/server/supabase-admin'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: wallet } = await admin.from('wallets').select('id, balance, updated_at').eq('user_id', id).single()
  const { data: txs } = await admin
    .from('wallet_transactions')
    .select('id, amount, type, status, reason, note, created_at')
    .eq('wallet_id', wallet?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ wallet, transactions: txs ?? [] })
}
