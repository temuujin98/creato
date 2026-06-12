import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/server/supabase-admin'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  const { id } = await params

  // Fetch generation — only columns safe to return (explicit list, no server-only cols)
  const admin = createAdminClient()
  const { data: generation, error } = await admin
    .from('generations')
    .select('id, user_id, status, output_paths, credit_cost, created_at, completed_at')
    .eq('id', id)
    .single()

  if (error || !generation) {
    return NextResponse.json({ error: 'Generation олдсонгүй' }, { status: 404 })
  }

  // Ownership check
  if (generation.user_id !== user.id) {
    return NextResponse.json({ error: 'Эрх байхгүй' }, { status: 403 })
  }

  // Generate signed URLs if completed
  let outputSignedUrls: string[] = []
  if (generation.status === 'completed' && generation.output_paths?.length) {
    for (const path of generation.output_paths as string[]) {
      const { data: signed } = await admin.storage
        .from('outputs')
        .createSignedUrl(path, 3600)
      if (signed?.signedUrl) outputSignedUrls.push(signed.signedUrl)
    }
  }

  // Whitelist — compiled_prompt, provider_used, model_used, error_message intentionally excluded
  return NextResponse.json({
    id: generation.id,
    status: generation.status,
    outputSignedUrls,
    creditCost: generation.credit_cost,
    createdAt: generation.created_at,
    completedAt: generation.completed_at,
  })
}
