import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/server/supabase-admin'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function PUT(req: Request) {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sections = await req.json() as Array<{
    id: string
    title?: string | null
    subtitle?: string | null
    is_visible?: boolean
    sort_order?: number
    cta_label?: string | null
    cta_url?: string | null
    layout_variant?: string | null
    background_variant?: string | null
    content_source?: unknown
  }>
  const admin = createAdminClient()
  for (const s of sections) {
    const { id, ...rest } = s
    await admin.from('homepage_sections').update(rest).eq('id', id)
  }
  return NextResponse.json({ ok: true })
}
