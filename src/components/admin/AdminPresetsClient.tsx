'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ACard, APill, TH, TD } from './AdminTable'

interface PresetRow {
  id: string
  slug: string
  name: string
  status: string
  creditCost: number
  isFeatured: boolean
  primaryModel: string | null
  categoryName: string
  createdAt: string
}

const STATUS_COLOR: Record<string, string> = {
  active: 'green',
  draft: 'gray',
  pending_review: 'amber',
  rejected: 'red',
  hidden: 'gray',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Идэвхтэй',
  draft: 'Ноорог',
  pending_review: 'Хянагдаж байна',
  rejected: 'Татгалзсан',
  hidden: 'Нуугдсан',
}

export default function AdminPresetsClient({ presets }: { presets: PresetRow[] }) {
  const [sortCol, setSortCol] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('all')

  function onSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    let list = presets
    if (filter !== 'all') list = list.filter(p => p.status === filter)
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
  }, [presets, sortCol, sortDir, filter])

  const sp = { sortCol, sortDir, onSort }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'pending_review', 'rejected', 'draft'].map(f => (
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
        <Link
          href="/admin/presets/new"
          // TODO 5b: preset editor page
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            color: '#fff',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          + Preset нэмэх
        </Link>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH col="name" {...sp}>Нэр</TH>
              <TH col="categoryName" {...sp}>Ангилал</TH>
              <TH col="primaryModel" {...sp}>Модел</TH>
              <TH col="status" {...sp}>Статус</TH>
              <TH col="creditCost" align="right" {...sp}>Cr</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>Preset олдсонгүй</td></tr>
            ) : sorted.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .12s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                <TD>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    {p.isFeatured && <APill color="purple">Онцлох</APill>}
                  </div>
                </TD>
                <TD style={{ color: '#71717A' }}>{p.categoryName}</TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>{p.primaryModel ?? '—'}</TD>
                <TD><APill color={STATUS_COLOR[p.status] ?? 'gray'}>{STATUS_LABEL[p.status] ?? p.status}</APill></TD>
                <TD style={{ textAlign: 'right', fontWeight: 700, color: '#C4B5FD' }}>{p.creditCost}</TD>
                <TD>
                  <Link
                    href={`/admin/presets/${p.slug}`}
                    style={{
                      background: 'rgba(255,255,255,.05)',
                      border: '1px solid rgba(255,255,255,.07)',
                      color: '#A1A1AA',
                      borderRadius: 6,
                      padding: '5px 10px',
                      fontSize: 12,
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Засах
                  </Link>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </ACard>
    </div>
  )
}
