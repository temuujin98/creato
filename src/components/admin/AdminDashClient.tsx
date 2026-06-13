'use client'

import { ACard, APill, TH, TD } from './AdminTable'

interface DashStats {
  totalUsers: number
  totalGenerations: number
  completedGenerations: number
  failedGenerations: number
  creditsSold: number
  creditsSpent: number
  creditsRefunded: number
  successRate: number
}

interface TopPreset {
  name: string
  count: number
}

interface RecentGen {
  id: string
  status: string
  presetName: string
  creditCost: number
  createdAt: string
  errorMessage: string | null
}

function BarChartSVG({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(...values, 1)
  const h = 180
  const barW = 32
  const gap = 8
  const total = labels.length
  const w = total * (barW + gap) - gap + 40

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = h - frac * h
        return (
          <line key={frac} x1={20} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
        )
      })}
      {labels.map((label, i) => {
        const barH = Math.max((values[i] / max) * h, 2)
        const x = 20 + i * (barW + gap)
        const y = h - barH
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={4} fill="rgba(124,58,237,.65)"
            />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,.4)">{label}</text>
            {values[i] > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#C4B5FD">{values[i]}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'green',
  failed: 'red',
  processing: 'amber',
  pending: 'gray',
}
const STATUS_LABEL: Record<string, string> = {
  completed: 'Амжилттай',
  failed: 'Амжилтгүй',
  processing: 'Боловсруулж байна',
  pending: 'Хүлээгдэж байна',
}

export default function AdminDashClient({
  stats,
  topPresets,
  chartData,
  recentGenerations,
}: {
  stats: DashStats
  topPresets: TopPreset[]
  chartData: { labels: string[]; credits: number[] }
  recentGenerations: RecentGen[]
}) {
  const statCards = [
    { l: 'Нийт хэрэглэгч', v: stats.totalUsers.toLocaleString(), color: '#38BDF8' },
    { l: 'Нийт генерац', v: stats.totalGenerations.toLocaleString(), color: '#C4B5FD' },
    { l: 'Амжилттай генерац', v: stats.completedGenerations.toLocaleString(), color: '#4ADE80' },
    { l: 'Амжилтгүй генерац', v: stats.failedGenerations.toLocaleString(), color: '#EF4444' },
    { l: 'Зарагдсан credit', v: stats.creditsSold.toLocaleString(), color: '#C4B5FD' },
    { l: 'Зарцуулсан credit', v: stats.creditsSpent.toLocaleString(), color: '#9D5FF5' },
    { l: 'Буцаасан credit', v: stats.creditsRefunded.toLocaleString(), color: '#FBBF24' },
    { l: 'Амжилтын хувь', v: `${stats.successRate}%`, color: stats.successRate >= 90 ? '#4ADE80' : '#FBBF24' },
    { l: 'AI өртөг (тооцоолол)', v: '—', color: '#52525B' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {statCards.map((s, i) => (
          <ACard key={i} style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#52525B', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', color: s.color }}>{s.v}</div>
          </ACard>
        ))}
      </div>

      {/* Bar chart */}
      <ACard>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Credit авалт (7 хоног)</div>
        <div style={{ padding: '8px 0' }}>
          <BarChartSVG labels={chartData.labels} values={chartData.credits} />
        </div>
      </ACard>

      {/* Top presets + recent gens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <ACard>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Шилдэг presets (ашиглалт)</div>
          {topPresets.length === 0 ? (
            <div style={{ color: '#52525B', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Дата байхгүй</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <TH>№</TH>
                  <TH>Preset</TH>
                  <TH align="right">Ашиглалт</TH>
                </tr>
              </thead>
              <tbody>
                {topPresets.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <TD style={{ color: '#52525B', fontWeight: 600, width: 32 }}>{i + 1}</TD>
                    <TD style={{ fontWeight: 500 }}>{p.name}</TD>
                    <TD style={{ textAlign: 'right', fontWeight: 700, color: '#C4B5FD' }}>{p.count}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ACard>

        <ACard>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Сүүлийн генерацууд</div>
          {recentGenerations.length === 0 ? (
            <div style={{ color: '#52525B', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Дата байхгүй</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentGenerations.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <APill color={STATUS_COLOR[g.status] ?? 'gray'}>
                    {STATUS_LABEL[g.status] ?? g.status}
                  </APill>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.presetName}</div>
                    <div style={{ fontSize: 11, color: '#52525B' }}>
                      {new Date(g.createdAt).toLocaleString('mn-MN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', flexShrink: 0 }}>{g.creditCost} cr</div>
                </div>
              ))}
            </div>
          )}
        </ACard>
      </div>
    </div>
  )
}
