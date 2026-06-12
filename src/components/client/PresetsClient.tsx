'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { PresetPublic } from '@/types/preset'

const GRAD_THUMBS = [
  'linear-gradient(160deg,#1A0A2E,#3D1B69,#7C3AED)',
  'linear-gradient(135deg,#0C1A2E,#164E63,#0EA5E9,#38BDF8)',
  'linear-gradient(135deg,#1A0515,#7C1D4E,#EC4899)',
  'linear-gradient(135deg,#0A1A0A,#14532D,#16A34A,#4ADE80)',
  'linear-gradient(135deg,#0F0A1E,#2D1B69,#C4B5FD)',
  'linear-gradient(135deg,#1A1000,#78350F,#D97706,#FCD34D)',
  'linear-gradient(160deg,#0A0F1E,#1E3A5F,#3B82F6)',
  'linear-gradient(160deg,#0A1A15,#134E4A,#2DD4BF)',
]

const TABS = [
  { id: 'featured', label: 'Онцлох' },
  { id: 'new', label: 'Шинэ' },
  { id: 'trending', label: 'Тренд' },
  { id: 'all', label: 'Бүгд' },
]

interface PresetsClientProps {
  presets: PresetPublic[]
}

export default function PresetsClient({ presets }: PresetsClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'featured' | 'new' | 'trending' | 'all'>('featured')
  const [category, setCategory] = useState('Бүгд')
  const [query, setQuery] = useState('')

  const categories = useMemo(() => {
    const unique = Array.from(new Set(presets.map(p => p.category_name).filter(Boolean) as string[]))
    return ['Бүгд', ...unique]
  }, [presets])

  const filtered = useMemo(() => {
    let list = presets
    if (tab === 'featured') list = list.filter(p => p.is_featured)
    else if (tab === 'new') list = list.filter(p => p.is_new)
    else if (tab === 'trending') list = list.filter(p => p.is_trending)
    if (category !== 'Бүгд') list = list.filter(p => p.category_name === category)
    if (query.trim()) list = list.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    return list
  }, [presets, tab, category, query])

  function getBadge(p: PresetPublic): { color: string; label: string } | null {
    if (p.is_featured) return { color: '#9D5FF5', label: 'Онцлох' }
    if (p.is_new) return { color: '#38BDF8', label: 'Шинэ' }
    if (p.is_trending) return { color: '#EC4899', label: 'Тренд' }
    return null
  }

  if (presets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#52525B' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#A1A1AA', marginBottom: 8 }}>Удахгүй preset нэмэгдэнэ</div>
        <div style={{ fontSize: 14, color: '#52525B' }}>Манай баг шинэ preset-үүдийг бэлтгэж байна. Тун удахгүй!</div>
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '10px 14px', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Preset хайх..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              border: `1px solid ${tab === t.id ? 'rgba(124,58,237,.5)' : 'rgba(255,255,255,.08)'}`,
              background: tab === t.id ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.04)',
              color: tab === t.id ? '#C4B5FD' : '#A1A1AA',
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '7px 16px',
              borderRadius: 100,
              border: `1px solid ${category === cat ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.07)'}`,
              background: category === cat ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.03)',
              color: category === cat ? '#fff' : '#A1A1AA',
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              flexShrink: 0,
              transition: 'all .15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#52525B' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#A1A1AA', marginBottom: 8 }}>Preset олдсонгүй</div>
          <div style={{ fontSize: 13 }}>Өөр хайлт эсвэл ангилал сонгоно уу</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map((p, i) => {
            const badge = getBadge(p)
            const grad = GRAD_THUMBS[i % GRAD_THUMBS.length]
            return (
              <PresetCard
                key={p.id}
                preset={p}
                gradient={grad}
                badge={badge}
                onClick={() => router.push(`/presets/${p.slug}`)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

interface PresetCardProps {
  preset: PresetPublic
  gradient: string
  badge: { color: string; label: string } | null
  onClick: () => void
}

function PresetCard({ preset, gradient, badge, onClick }: PresetCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#12121C',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = '0 16px 48px rgba(0,0,0,.5)'
        el.style.borderColor = 'rgba(124,58,237,.25)'
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
        el.style.borderColor = 'rgba(255,255,255,.08)'
      }}
    >
      <div style={{ aspectRatio: '3/2', background: gradient, position: 'relative' }}>
        {badge && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: `${badge.color}26`,
              border: `1px solid ${badge.color}4D`,
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: badge.color,
              whiteSpace: 'nowrap',
            }}>
              {badge.label}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        {preset.category_name && (
          <div style={{ fontSize: 11, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
            {preset.category_name}
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, lineHeight: 1.35 }}>
          {preset.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: 'rgba(124,58,237,.12)',
            border: '1px solid rgba(124,58,237,.25)',
            borderRadius: 100,
            padding: '3px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: '#C4B5FD',
          }}>
            {preset.credit_cost} cr
          </span>
        </div>
      </div>
    </div>
  )
}
