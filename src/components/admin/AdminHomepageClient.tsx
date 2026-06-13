'use client'

import { useState, useCallback } from 'react'

interface Section {
  id: string
  section_key: string
  section_type: string
  title: string | null
  subtitle: string | null
  is_visible: boolean
  sort_order: number
  layout_variant: string | null
  background_variant: string | null
  cta_label: string | null
  cta_url: string | null
  content_source: unknown
  updated_at: string
}

const TYPE_LABELS: Record<string, string> = {
  hero: 'Гарчиг хэсэг',
  benefit_strip: 'Давуу талын мөр',
  featured_presets: 'Онцлох presets',
  how_it_works: 'Хэрхэн ажилладаг',
  showcase: 'Жишээ зурагнууд',
  creator_community: 'Бүтээгчийн нийгэмлэг',
  business_use_cases: 'Бизнесийн хэрэглээ',
  faq: 'Түгээмэл асуулт',
  final_cta: 'Эцсийн заалт',
  custom_content: 'Тусгай контент',
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#E4E4E7',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#52525B',
  textTransform: 'uppercase',
  letterSpacing: '.7px',
  marginBottom: 5,
  display: 'block',
}

function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeSlash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function SectionCard({
  section,
  isDirty,
  onChange,
}: {
  section: Section
  isDirty: boolean
  onChange: (id: string, patch: Partial<Section>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [jsonRaw, setJsonRaw] = useState(
    section.content_source != null
      ? JSON.stringify(section.content_source, null, 2)
      : ''
  )

  function handleJsonBlur() {
    if (!jsonRaw.trim()) {
      onChange(section.id, { content_source: null })
      setJsonError(null)
      return
    }
    try {
      const parsed = JSON.parse(jsonRaw)
      onChange(section.id, { content_source: parsed })
      setJsonError(null)
    } catch {
      setJsonError('JSON алдаатай байна')
    }
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,.03)',
        border: isDirty ? '1px solid rgba(124,58,237,.4)' : '1px solid rgba(255,255,255,.06)',
        borderLeft: isDirty ? '3px solid #7C3AED' : '1px solid rgba(255,255,255,.06)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color .15s',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Drag handle (visual only) */}
        <span style={{ color: '#3F3F46', fontSize: 16, flexShrink: 0, cursor: 'default' }}>≡</span>

        {/* Sort order */}
        <input
          type="number"
          value={section.sort_order}
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(section.id, { sort_order: Number(e.target.value) })}
          style={{
            ...INPUT_STYLE,
            width: 52,
            padding: '4px 8px',
            textAlign: 'center',
            fontSize: 12,
          }}
        />

        {/* Type badge */}
        <span style={{
          display: 'inline-block',
          background: 'rgba(124,58,237,.12)',
          border: '1px solid rgba(124,58,237,.25)',
          borderRadius: 100,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: '#C4B5FD',
          flexShrink: 0,
        }}>
          {TYPE_LABELS[section.section_type] ?? section.section_type}
        </span>

        {/* Title preview */}
        <span style={{ flex: 1, fontSize: 13, color: section.title ? '#E4E4E7' : '#52525B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {section.title ?? section.section_key}
        </span>

        {isDirty && (
          <span style={{ fontSize: 10, color: '#C4B5FD', fontWeight: 600, flexShrink: 0 }}>●</span>
        )}

        {/* Visible toggle */}
        <button
          onClick={e => { e.stopPropagation(); onChange(section.id, { is_visible: !section.is_visible }) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
          title={section.is_visible ? 'Нуух' : 'Харуулах'}
        >
          {section.is_visible ? <EyeOpen /> : <EyeSlash />}
        </button>

        {/* Expand chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#52525B" strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Гарчиг</label>
              <input
                style={INPUT_STYLE}
                value={section.title ?? ''}
                onChange={e => onChange(section.id, { title: e.target.value || null })}
                placeholder="Гарчиг..."
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Layout variant</label>
              <input
                style={INPUT_STYLE}
                value={section.layout_variant ?? ''}
                onChange={e => onChange(section.id, { layout_variant: e.target.value || null })}
                placeholder="default / split / centered..."
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={LABEL_STYLE}>Дэд гарчиг</label>
            <textarea
              style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 64 }}
              value={section.subtitle ?? ''}
              onChange={e => onChange(section.id, { subtitle: e.target.value || null })}
              placeholder="Дэд гарчиг..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={LABEL_STYLE}>CTA текст</label>
              <input
                style={INPUT_STYLE}
                value={section.cta_label ?? ''}
                onChange={e => onChange(section.id, { cta_label: e.target.value || null })}
                placeholder="Эхлэх..."
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>CTA URL</label>
              <input
                style={INPUT_STYLE}
                value={section.cta_url ?? ''}
                onChange={e => onChange(section.id, { cta_url: e.target.value || null })}
                placeholder="/register"
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Background variant</label>
              <input
                style={INPUT_STYLE}
                value={section.background_variant ?? ''}
                onChange={e => onChange(section.id, { background_variant: e.target.value || null })}
                placeholder="dark / light / gradient..."
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={LABEL_STYLE}>Content source (JSON)</label>
            <textarea
              style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 80, fontFamily: 'monospace', fontSize: 12 }}
              value={jsonRaw}
              onChange={e => setJsonRaw(e.target.value)}
              onBlur={handleJsonBlur}
              placeholder='{"items": []}'
            />
            {jsonError && (
              <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{jsonError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminHomepageClient({ sections: initial }: { sections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initial)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const handleChange = useCallback((id: string, patch: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
    setDirtyIds(prev => new Set([...prev, id]))
  }, [])

  async function handleSaveAll() {
    const dirty = sections.filter(s => dirtyIds.has(s.id))
    if (dirty.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dirty.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          is_visible: s.is_visible,
          sort_order: s.sort_order,
          cta_label: s.cta_label,
          cta_url: s.cta_url,
          layout_variant: s.layout_variant,
          background_variant: s.background_variant,
          content_source: s.content_source,
        }))),
      })
      if (!res.ok) throw new Error('Server error')
      setDirtyIds(new Set())
      setToast({ msg: 'Амжилттай хадгаллаа', ok: true })
    } catch {
      setToast({ msg: 'Хадгалахад алдаа гарлаа', ok: false })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.ok ? 'rgba(74,222,128,.15)' : 'rgba(239,68,68,.15)',
          border: `1px solid ${toast.ok ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
          borderRadius: 8, padding: '10px 16px', fontSize: 13,
          color: toast.ok ? '#4ADE80' : '#EF4444',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7' }}>
          Homepage Sections{' '}
          <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({sections.length})</span>
          {dirtyIds.size > 0 && (
            <span style={{ fontSize: 11, color: '#C4B5FD', marginLeft: 8 }}>{dirtyIds.size} өөрчлөлт</span>
          )}
        </h2>
        <button
          onClick={handleSaveAll}
          disabled={saving || dirtyIds.size === 0}
          style={{
            background: dirtyIds.size > 0 ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'rgba(255,255,255,.05)',
            color: dirtyIds.size > 0 ? '#fff' : '#52525B',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: dirtyIds.size > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit',
            transition: 'background .15s',
          }}
        >
          {saving ? 'Хадгалж байна...' : 'Бүгдийг хадгалах'}
        </button>
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map(s => (
          <SectionCard
            key={s.id}
            section={s}
            isDirty={dirtyIds.has(s.id)}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  )
}
