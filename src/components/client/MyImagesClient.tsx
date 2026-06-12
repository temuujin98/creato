'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type GenerationRow = {
  id: string
  status: string
  output_paths: string[]
  credit_cost: number
  created_at: string
  completed_at: string | null
  selected_size: string | null
  preset_id: string
}

type ImageItem = {
  genId: string
  path: string
  signedUrl: string | null
  creditCost: number
  createdAt: string
  selectedSize: string | null
}

interface MyImagesClientProps {
  generations: GenerationRow[]
}

type Filter = 'all' | 'today' | 'week'

export default function MyImagesClient({ generations }: MyImagesClientProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [items, setItems] = useState<ImageItem[]>([])
  const [loadingUrls, setLoadingUrls] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Flatten output_paths from each generation into image items, then fetch signed URLs
  useEffect(() => {
    const flat: ImageItem[] = []
    for (const g of generations) {
      for (const path of g.output_paths ?? []) {
        flat.push({
          genId: g.id,
          path,
          signedUrl: null,
          creditCost: g.credit_cost,
          createdAt: g.created_at,
          selectedSize: g.selected_size,
        })
      }
    }
    setItems(flat)
    setLoadingUrls(false)

    // Fetch signed URLs via GET /api/generate/[id] for each unique generation
    const uniqueIds = [...new Set(generations.map(g => g.id))]
    Promise.all(
      uniqueIds.map(id =>
        fetch(`/api/generate/${id}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      const urlMap = new Map<string, string[]>()
      for (let i = 0; i < uniqueIds.length; i++) {
        const res = results[i]
        if (res?.outputSignedUrls) {
          urlMap.set(uniqueIds[i], res.outputSignedUrls)
        }
      }
      setItems(prev =>
        prev.map(item => {
          const urls = urlMap.get(item.genId)
          if (urls) {
            const pathIndex = generations
              .find(g => g.id === item.genId)
              ?.output_paths?.indexOf(item.path) ?? 0
            return { ...item, signedUrl: urls[pathIndex] ?? null }
          }
          return item
        })
      )
      setLoadingUrls(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function filterItems(items: ImageItem[]): ImageItem[] {
    const now = new Date()
    if (filter === 'today') {
      return items.filter(item => {
        const d = new Date(item.createdAt)
        return d.toDateString() === now.toDateString()
      })
    }
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return items.filter(item => new Date(item.createdAt) >= weekAgo)
    }
    return items
  }

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function toggleSelect(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const displayed = filterItems(items)

  if (items.length === 0 && !loadingUrls) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', color: '#52525B' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#3F3F46' }}>◻</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#A1A1AA', marginBottom: 8 }}>Зураг байхгүй байна</div>
        <p style={{ fontSize: 14, marginBottom: 24 }}>Эхний зургаа үүсгэж эхэл!</p>
        <Link
          href="/presets"
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            textDecoration: 'none',
          }}
        >
          Preset үзэх →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.5px', margin: 0 }}>
          Миний зургууд{' '}
          <span style={{ fontSize: 14, color: '#52525B', fontWeight: 400 }}>({displayed.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'today', 'week'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px',
                borderRadius: 100,
                border: `1px solid ${filter === f ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.07)'}`,
                background: filter === f ? 'rgba(124,58,237,.12)' : 'transparent',
                color: filter === f ? '#C4B5FD' : '#A1A1AA',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {f === 'all' ? 'Бүгд' : f === 'today' ? 'Өнөөдөр' : '7 хоног'}
            </button>
          ))}
        </div>
      </div>

      {loadingUrls && items.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: '#12121C', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,.03)' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ height: 12, background: 'rgba(255,255,255,.05)', borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 10, background: 'rgba(255,255,255,.03)', borderRadius: 4, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {displayed.map(item => {
            const key = `${item.genId}-${item.path}`
            const isSelected = selected.has(key)
            return (
              <div
                key={key}
                onClick={() => toggleSelect(key)}
                style={{
                  background: '#12121C',
                  border: `1px solid ${isSelected ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.07)'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color .2s',
                  position: 'relative',
                }}
              >
                <div style={{ aspectRatio: '1', position: 'relative', background: '#0C0B1A' }}>
                  {item.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.signedUrl}
                      alt="Generated"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#1A0A2E,#3D1B69,#7C3AED)' }} />
                  )}
                  {isSelected && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#52525B', marginBottom: 9 }}>
                    {item.selectedSize ?? '1:1'} · {formatDate(item.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {/* Download */}
                    {item.signedUrl ? (
                      <a
                        href={item.signedUrl}
                        download
                        onClick={e => e.stopPropagation()}
                        title="Татах"
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '7px 4px', cursor: 'pointer', textDecoration: 'none', color: '#A1A1AA' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v13M7 11l5 5 5-5" /><path d="M5 21h14" />
                        </svg>
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.3px', fontFamily: 'inherit' }}>Татах</span>
                      </a>
                    ) : (
                      <button disabled title="Татах" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '7px 4px', cursor: 'not-allowed', color: '#3F3F46' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v13M7 11l5 5 5-5" /><path d="M5 21h14" />
                        </svg>
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.3px', fontFamily: 'inherit' }}>Татах</span>
                      </button>
                    )}
                    {/* Re-generate */}
                    <Link
                      href="/presets"
                      onClick={e => e.stopPropagation()}
                      title="Дахин үүсгэх"
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.22)', borderRadius: 8, padding: '7px 4px', cursor: 'pointer', color: '#9D5FF5', textDecoration: 'none' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                      </svg>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.3px', fontFamily: 'inherit' }}>Үүсгэх</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13,13,20,.95)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(16px)',
          zIndex: 200,
          boxShadow: '0 16px 48px rgba(0,0,0,.6)',
        }}>
          <span style={{ fontSize: 13, color: '#A1A1AA' }}>{selected.size} зураг сонгогдсон</span>
          <button
            onClick={() => setSelected(new Set())}
            style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
