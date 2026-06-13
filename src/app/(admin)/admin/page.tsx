import { createAdminClient } from '@/server/supabase-admin'
import AdminDashClient from '@/components/admin/AdminDashClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashPage() {
  const admin = createAdminClient()

  // Parallel data fetches
  const [
    { count: totalUsers },
    { count: totalGenerations },
    { count: completedGenerations },
    { count: failedGenerations },
    { data: walletTxns },
    { data: topPresetsRaw },
    { data: recentGenerations },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('generations').select('*', { count: 'exact', head: true }),
    admin.from('generations').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    admin.from('generations').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    admin.from('wallet_transactions')
      .select('type, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    admin.from('generations')
      .select('preset_id, presets(name)')
      .eq('status', 'completed')
      .limit(500),
    admin.from('generations')
      .select('id, status, credit_cost, created_at, error_message, compiled_prompt, preset_id, presets(name)')
      .order('created_at', { ascending: false })
      .limit(7),
  ])

  // Credits sold (purchases)
  const creditsSold = (walletTxns ?? [])
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  // Credits spent (generation_spend)
  const creditsSpent = (walletTxns ?? [])
    .filter(t => t.type === 'generation_spend')
    .reduce((sum, t) => sum + Math.abs(t.amount ?? 0), 0)

  // Credits refunded
  const creditsRefunded = (walletTxns ?? [])
    .filter(t => t.type === 'generation_refund')
    .reduce((sum, t) => sum + Math.abs(t.amount ?? 0), 0)

  // Top presets by usage count
  const presetUsage: Record<string, { name: string; count: number }> = {}
  for (const g of topPresetsRaw ?? []) {
    const pid = g.preset_id as string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (g as any).presets?.name ?? pid
    if (!presetUsage[pid]) presetUsage[pid] = { name, count: 0 }
    presetUsage[pid].count++
  }
  const topPresets = Object.values(presetUsage)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Generations by day (last 7 days)
  const dayMap: Record<string, number> = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const g of (topPresetsRaw ?? [])) {
    // skip — we use recentGenerations for this
  }
  // Use wallet_transactions for per-day chart (purchases)
  const dayLabels = Object.keys(dayMap)
  const purchaseByDay: Record<string, number> = {}
  for (const k of dayLabels) purchaseByDay[k] = 0
  for (const t of walletTxns ?? []) {
    const day = t.created_at?.slice(0, 10)
    if (day && purchaseByDay[day] !== undefined && t.type === 'purchase') {
      purchaseByDay[day] += t.amount ?? 0
    }
  }

  const chartData = {
    labels: dayLabels.map(d => d.slice(5)),
    credits: dayLabels.map(d => purchaseByDay[d]),
  }

  const stats = {
    totalUsers: totalUsers ?? 0,
    totalGenerations: totalGenerations ?? 0,
    completedGenerations: completedGenerations ?? 0,
    failedGenerations: failedGenerations ?? 0,
    creditsSold,
    creditsSpent,
    creditsRefunded,
    successRate: totalGenerations
      ? Math.round(((completedGenerations ?? 0) / totalGenerations) * 100)
      : 0,
  }

  return (
    <AdminDashClient
      stats={stats}
      topPresets={topPresets}
      chartData={chartData}
      recentGenerations={(recentGenerations ?? []).map(g => ({
        id: g.id as string,
        status: g.status as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presetName: (g as any).presets?.name ?? '—',
        creditCost: g.credit_cost as number,
        createdAt: g.created_at as string,
        errorMessage: g.error_message as string | null,
      }))}
    />
  )
}
