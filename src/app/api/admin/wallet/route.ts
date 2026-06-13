import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const body = await req.json() as {
    user_id: string
    amount: number
    type: string
    reason: string
    note: string
  }

  if (!body.reason?.trim() || !body.note?.trim()) {
    return NextResponse.json({ error: 'Шалтгаан болон тэмдэглэл заавал' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('admin_adjust_credits', {
    p_user: body.user_id,
    p_amount: body.amount,
    p_type: body.type,
    p_reason: body.reason,
    p_note: body.note,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, tx_id: data })
}
