'use client'

import { useState, useMemo } from 'react'
import { ACard, APill, TH, TD } from './AdminTable'

interface GenRow {
  id: string
  status: string
  creditCost: number
  createdAt: string
  completedAt: string | null
  selectedSize: string | null
  presetName: string
  compiledPrompt: string | null
  errorMessage: string | null
  attemptCount: number | null
  providerUsed: string | null
  modelUsed: string | null
  userId: string
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

export default function AdminGenerationsClient({ generations }: { generations: GenRow[] }) {
  const [sortCol, setSortCol] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  function onSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    let list = generations
    if (filter !== 'all') list = list.filter(g => g.status === filter)
    return [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortCol]
      const bv = (b as unknown as Record<string, unknown>)[sortCol]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return 0
    })
  }, [generations, sortCol, sortDir, filter])

  const sp = { sortCol, sortDir, onSort }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
          Генерацууд <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({generations.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'completed', 'failed', 'processing'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px', borderRadius: 100,
                border: `1px solid ${filter === f ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.06)'}`,
                background: filter === f ? 'rgba(124,58,237,.12)' : 'transparent',
                color: filter === f ? '#C4B5FD' : '#71717A',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {f === 'all' ? 'Бүгд' : (STATUS_LABEL[f] ?? f)}
            </button>
          ))}
        </div>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH col="presetName" {...sp}>Preset</TH>
              <TH col="status" {...sp}>Статус</TH>
              <TH col="providerUsed" {...sp}>Provider</TH>
              <TH col="creditCost" align="right" {...sp}>Cr</TH>
              <TH col="attemptCount" align="right" {...sp}>Оролдлого</TH>
              <TH col="createdAt" {...sp}>Цаг</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>Генерац олдсонгүй</td></tr>
            ) : sorted.map((g, i) => (
              <>
                <tr
                  key={g.id}
                  style={{ borderBottom: expanded === g.id ? 'none' : '1px solid rgba(255,255,255,.03)', transition: 'background .12s', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                >
                  <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                  <TD style={{ fontWeight: 500, maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.presetName}</div>
                  </TD>
                  <TD><APill color={STATUS_COLOR[g.status] ?? 'gray'}>{STATUS_LABEL[g.status] ?? g.status}</APill></TD>
                  <TD style={{ color: '#71717A', fontSize: 12 }}>{g.providerUsed ?? '—'}</TD>
                  <TD style={{ textAlign: 'right', fontWeight: 700, color: '#C4B5FD' }}>{g.creditCost}</TD>
                  <TD style={{ textAlign: 'right', color: '#A1A1AA' }}>{g.attemptCount ?? '—'}</TD>
                  <TD style={{ color: '#71717A', fontSize: 12 }}>{new Date(g.createdAt).toLocaleString('mn-MN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</TD>
                  <TD style={{ color: '#52525B', fontSize: 12 }}>{expanded === g.id ? '▲' : '▼'}</TD>
                </tr>
                {expanded === g.id && (
                  <tr key={g.id + '-exp'} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td colSpan={8} style={{ padding: '10px 12px 14px 52px', background: 'rgba(124,58,237,.04)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {g.compiledPrompt && (
                          <div>
                            <div style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 4 }}>Compiled Prompt</div>
                            <div style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{g.compiledPrompt}</div>
                          </div>
                        )}
                        {g.errorMessage && (
                          <div>
                            <div style={{ fontSize: 10, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 4 }}>Error</div>
                            <div style={{ fontSize: 12, color: '#EF4444', lineHeight: 1.5, wordBreak: 'break-word' }}>{g.errorMessage}</div>
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#52525B' }}>
                          <span>Model: {g.modelUsed ?? '—'}</span>
                          {g.selectedSize && <span style={{ marginLeft: 12 }}>Size: {g.selectedSize}</span>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </ACard>
    </div>
  )
}
