import { createAdminClient } from '@/server/supabase-admin'
import AdminGenerationsClient from '@/components/admin/AdminGenerationsClient'

export const dynamic = 'force-dynamic'

export default async function AdminGenerationsPage() {
  const admin = createAdminClient()

  // Admin can see ALL columns including server-only ones (compiled_prompt, error_message, etc.)
  const { data } = await admin
    .from('generations')
    .select(`
      id, status, credit_cost, created_at, completed_at, selected_size,
      compiled_prompt, error_message, attempt_count, provider_used, model_used,
      user_id, preset_id,
      presets(name)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (data ?? []).map(g => ({
    id: g.id as string,
    status: g.status as string,
    creditCost: g.credit_cost as number,
    createdAt: g.created_at as string,
    completedAt: g.completed_at as string | null,
    selectedSize: g.selected_size as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presetName: (g as any).presets?.name ?? '—',
    compiledPrompt: g.compiled_prompt as string | null,
    errorMessage: g.error_message as string | null,
    attemptCount: g.attempt_count as number | null,
    providerUsed: g.provider_used as string | null,
    modelUsed: g.model_used as string | null,
    userId: g.user_id as string,
  }))

  return <AdminGenerationsClient generations={rows} />
}
