'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ───────────────────────────────────────────────────────────────────

export interface PresetRow {
  id: string
  slug: string
  category_id: string | null
  name: string
  short_description: string | null
  full_description: string | null
  user_guide: string | null
  thumbnail_url: string | null
  example_image_urls: string[]
  credit_cost: number
  status: string
  sort_order: number
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_new: boolean
  requires_image: boolean
  min_image_count: number
  max_image_count: number
  allowed_file_types: string[]
  max_file_size_mb: number
  upload_guide_text: string | null
  allowed_sizes: string[]
  output_count: number
  // server-only — flow only through API
  base_prompt: string | null
  negative_prompt: string | null
  prompt_suffix: string | null
  quality_prompt: string | null
  cleanup_prompt: string | null
  internal_note: string | null
  prompt_version: number
  primary_provider: string
  primary_model: string | null
  fallback_provider: string | null
  fallback_model: string | null
  quality_preset: string
  retry_limit: number
  cleanup_enabled: boolean
  credit_override: boolean
  credit_override_reason: string | null
}

export interface FieldRow {
  id?: string
  preset_id?: string
  field_key: string
  label: string
  input_type: string
  required: boolean
  placeholder: string | null
  help_text: string | null
  default_value: string | null
  choices: unknown
  prompt_mapping: string | null
  sort_order: number
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
}

// ── Style constants ─────────────────────────────────────────────────────────

const INP_S: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#E4E4E7',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const TA_S: React.CSSProperties = { ...INP_S, resize: 'vertical' as const }

const MONO_S: React.CSSProperties = {
  ...TA_S,
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 12,
}

function FL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', gap, marginBottom: 16, flexWrap: 'wrap' }}>{children}</div>
}

function Field({ children, flex = 1, style = {} }: { children: React.ReactNode; flex?: number; style?: React.CSSProperties }) {
  return <div style={{ flex, minWidth: 140, ...style }}>{children}</div>
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 16, ...style }}>
      {children}
    </div>
  )
}


function Hint({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 11, color: '#52525B', marginTop: 5, lineHeight: 1.5, ...style }}>
      {children}
    </div>
  )
}

function Req() {
  return <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
}

const SEL_S: React.CSSProperties = {
  width: '100%',
  background: '#12121A',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 8,
  padding: '9px 32px 9px 12px',
  color: '#E4E4E7',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  cursor: 'pointer',
}

function DarkSelect({ value, onChange, children, style = {} }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...SEL_S, ...style }}
      >
        {children}
      </select>
      <span style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: '#52525B', fontSize: 10,
      }}>▼</span>
    </div>
  )
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const json = await res.json() as { url?: string; error?: string }
  if (!res.ok || json.error) throw new Error(json.error ?? 'Upload failed')
  return json.url!
}

const DROPZONE_S: React.CSSProperties = {
  border: '2px dashed rgba(255,255,255,.12)',
  borderRadius: 10,
  padding: 20,
  textAlign: 'center',
  cursor: 'pointer',
  color: '#52525B',
  fontSize: 12,
  transition: 'border-color .15s, color .15s',
}

function ImageDropzone({ url, onUrl, folder, label }: {
  url: string
  onUrl: (url: string) => void
  folder: string
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [err, setErr] = useState('')
  const inputRef = { current: null as HTMLInputElement | null }

  async function handleFile(file: File) {
    setUploading(true)
    setErr('')
    try {
      const uploadedUrl = await uploadFile(file, folder)
      onUrl(uploadedUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload алдаа')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        style={{
          ...DROPZONE_S,
          borderColor: hovered ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.12)',
          color: hovered ? '#A1A1AA' : '#52525B',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
      >
        <input
          ref={el => { inputRef.current = el }}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        {uploading ? (
          <span style={{ color: '#C4B5FD' }}>Байршуулж байна...</span>
        ) : (
          <>
            <div style={{ marginBottom: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginBottom: 4 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>Зураг чирж оруулах эсвэл дарж сонгох</div>
          </>
        )}
      </div>
      {err && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{err}</div>}
      {url && (
        <div style={{ marginTop: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 6, border: '1px solid rgba(255,255,255,.08)', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <input
          style={INP_S}
          value={url}
          onChange={e => onUrl(e.target.value)}
          placeholder="https://... (URL шууд оруулах)"
        />
      </div>
    </div>
  )
}

function CustomCheckbox({ checked, onChange, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: React.ReactNode
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' as const }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: checked ? '#7C3AED' : 'rgba(255,255,255,.04)',
        border: checked ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} readOnly />
      </span>
      <span style={{ fontSize: 13, color: '#A1A1AA' }}>{label}</span>
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 12, marginTop: 4 }}>{children}</div>
}

function Divider() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '20px 0' }} />
}

// ── Chip toggle ─────────────────────────────────────────────────────────────

function ChipToggle({
  label,
  active,
  onClick,
  accent = '#4ADE80',
}: {
  label: string
  active: boolean
  onClick: () => void
  accent?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 100,
        border: `1px solid ${active ? accent + '55' : 'rgba(255,255,255,.08)'}`,
        background: active ? accent + '18' : 'transparent',
        color: active ? accent : '#71717A',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all .12s',
      }}
    >
      {label}
    </button>
  )
}

// ── FieldRow accordion ──────────────────────────────────────────────────────

function FieldAccordion({
  varKey,
  field,
  inPrompt,
  onSave,
}: {
  varKey: string
  field: FieldRow | null
  inPrompt: boolean
  onSave: (key: string, updated: FieldRow) => void
}) {
  const [open, setOpen] = useState(!field)
  const [local, setLocal] = useState<FieldRow>(
    field ?? {
      field_key: varKey,
      label: varKey,
      input_type: 'text',
      required: false,
      placeholder: null,
      help_text: null,
      default_value: null,
      choices: null,
      prompt_mapping: `[${varKey}]`,
      sort_order: 0,
      is_active: true,
    }
  )

  function set(key: keyof FieldRow, val: unknown) {
    setLocal(prev => ({ ...prev, [key]: val }))
  }

  const isUnconfigured = !field
  const isUnused = field && !inPrompt

  return (
    <div style={{ border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: open ? 'rgba(255,255,255,.03)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#E4E4E7',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#C4B5FD', background: 'rgba(124,58,237,.15)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
          [{varKey}]
        </span>
        <span style={{ fontSize: 13, flex: 1 }}>{local.label || varKey}</span>
        <span style={{ fontSize: 11, color: '#52525B', marginRight: 4 }}>{local.input_type}</span>
        {local.required && <span style={{ color: '#EF4444', fontSize: 12 }}>*</span>}
        {isUnconfigured && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#FBBF24', background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 100, padding: '1px 7px' }}>
            Тохиргоогүй
          </span>
        )}
        {isUnused && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#71717A', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 100, padding: '1px 7px' }}>
            Ашиглагдаагүй
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <Row>
            <Field>
              <FL>Field Key</FL>
              <input style={INP_S} value={local.field_key} onChange={e => set('field_key', e.target.value)} />
            </Field>
            <Field>
              <FL>Label</FL>
              <input style={INP_S} value={local.label} onChange={e => set('label', e.target.value)} />
            </Field>
            <Field flex={0} style={{ minWidth: 140 }}>
              <FL>Input Type</FL>
              <DarkSelect value={local.input_type} onChange={v => set('input_type', v)}>
                {['text','textarea','select','radio','checkbox','color','number','image','aspect_ratio'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </DarkSelect>
            </Field>
            <Field flex={0} style={{ minWidth: 80 }}>
              <FL>Sort</FL>
              <input style={INP_S} type="number" value={local.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
            </Field>
          </Row>

          {['select','radio','checkbox'].includes(local.input_type) && (
            <Row>
              <Field>
                <FL>Сонголтууд (таслалаар тусгаарлана)</FL>
                <input
                  style={INP_S}
                  placeholder="Улаан, Шар, Цэнхэр"
                  value={
                    Array.isArray(local.choices)
                      ? (local.choices as string[]).join(', ')
                      : typeof local.choices === 'string'
                        ? local.choices
                        : ''
                  }
                  onChange={e => set('choices', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </Field>
            </Row>
          )}

          <Row>
            <Field>
              <FL>Placeholder</FL>
              <input style={INP_S} value={local.placeholder ?? ''} onChange={e => set('placeholder', e.target.value || null)} />
            </Field>
            <Field>
              <FL>Default Value</FL>
              <input style={INP_S} value={local.default_value ?? ''} onChange={e => set('default_value', e.target.value || null)} />
            </Field>
          </Row>

          <Row>
            <Field>
              <FL>Help Text</FL>
              <input style={INP_S} value={local.help_text ?? ''} onChange={e => set('help_text', e.target.value || null)} />
            </Field>
            <Field>
              <FL>Prompt Mapping</FL>
              <input style={INP_S} value={local.prompt_mapping ?? `[${varKey}]`} onChange={e => set('prompt_mapping', e.target.value || null)} placeholder={`[${varKey}]`} />
            </Field>
          </Row>

          <Row gap={16}>
            <CustomCheckbox checked={local.required} onChange={v => set('required', v)} label="Заавал" />
            <CustomCheckbox checked={local.is_active} onChange={v => set('is_active', v)} label="Идэвхтэй" />
          </Row>

          <button
            type="button"
            onClick={() => onSave(varKey, { ...local })}
            style={{
              background: 'rgba(124,58,237,.15)',
              border: '1px solid rgba(124,58,237,.3)',
              color: '#C4B5FD',
              borderRadius: 7,
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Хадгалах
          </button>
        </div>
      )}
    </div>
  )
}

// ── Draft type ──────────────────────────────────────────────────────────────

type DraftField = FieldRow & { _key: string }

interface Draft {
  name: string
  slug: string
  category_id: string
  short_description: string
  full_description: string
  user_guide: string
  thumbnail_url: string
  example_image_urls: string[]
  credit_cost: number
  status: string
  sort_order: number
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_new: boolean
  requires_image: boolean
  min_image_count: number
  max_image_count: number
  allowed_file_types: string[]
  max_file_size_mb: number
  upload_guide_text: string
  allowed_sizes: string[]
  output_count: number
  base_prompt: string
  negative_prompt: string
  prompt_suffix: string
  quality_prompt: string
  cleanup_prompt: string
  internal_note: string
  prompt_version: number
  primary_provider: string
  primary_model: string
  fallback_provider: string
  fallback_model: string
  quality_preset: string
  retry_limit: number
  cleanup_enabled: boolean
  credit_override: boolean
  credit_override_reason: string
  fields: DraftField[]
}

function buildInitialDraft(preset: PresetRow | null, fields: FieldRow[]): Draft {
  const p = preset
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    category_id: p?.category_id ?? '',
    short_description: p?.short_description ?? '',
    full_description: p?.full_description ?? '',
    user_guide: p?.user_guide ?? '',
    thumbnail_url: p?.thumbnail_url ?? '',
    example_image_urls: p?.example_image_urls ?? ['', '', '', ''],
    credit_cost: p?.credit_cost ?? 1,
    status: p?.status ?? 'draft',
    sort_order: p?.sort_order ?? 0,
    is_featured: p?.is_featured ?? false,
    is_trending: p?.is_trending ?? false,
    is_popular: p?.is_popular ?? false,
    is_new: p?.is_new ?? true,
    requires_image: p?.requires_image ?? false,
    min_image_count: p?.min_image_count ?? 1,
    max_image_count: p?.max_image_count ?? 1,
    allowed_file_types: p?.allowed_file_types ?? ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size_mb: p?.max_file_size_mb ?? 10,
    upload_guide_text: p?.upload_guide_text ?? '',
    allowed_sizes: p?.allowed_sizes ?? ['1:1'],
    output_count: p?.output_count ?? 1,
    base_prompt: p?.base_prompt ?? '',
    negative_prompt: p?.negative_prompt ?? '',
    prompt_suffix: p?.prompt_suffix ?? '',
    quality_prompt: p?.quality_prompt ?? '',
    cleanup_prompt: p?.cleanup_prompt ?? '',
    internal_note: p?.internal_note ?? '',
    prompt_version: p?.prompt_version ?? 1,
    primary_provider: p?.primary_provider ?? 'gemini',
    primary_model: p?.primary_model ?? 'gemini-2.5-flash-image',
    fallback_provider: p?.fallback_provider ?? '',
    fallback_model: p?.fallback_model ?? '',
    quality_preset: p?.quality_preset ?? 'standard',
    retry_limit: p?.retry_limit ?? 1,
    cleanup_enabled: p?.cleanup_enabled ?? false,
    credit_override: p?.credit_override ?? false,
    credit_override_reason: p?.credit_override_reason ?? '',
    fields: fields.map(f => ({ ...f, _key: f.field_key })),
  }
}

// ── Main component ──────────────────────────────────────────────────────────

interface Props {
  id: string
  preset: PresetRow | null
  fields: FieldRow[]
  categories: Category[]
}

const TABS = [
  { key: 'basic', label: 'Үндсэн' },
  { key: 'model', label: 'Модел' },
  { key: 'prompt', label: 'Prompt & Fields' },
  { key: 'media', label: 'Зураг' },
  { key: 'credit', label: 'Credit' },
] as const

type TabKey = typeof TABS[number]['key']

const ALL_SIZES = ['1:1', '4:5', '9:16', '16:9', '3:4']
const ALL_FILE_TYPES = ['jpg', 'jpeg', 'png', 'webp']

const STATUS_LABELS: Record<string, string> = {
  draft: 'Ноорог',
  active: 'Идэвхтэй',
  hidden: 'Нуугдсан',
}

export default function PresetEditorClient({ id, preset, fields, categories }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('basic')
  const [draft, setDraft] = useState<Draft>(() => buildInitialDraft(preset, fields))
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [slugAutoGen, setSlugAutoGen] = useState(!preset?.slug)

  // Auto-generate slug from name
  useEffect(() => {
    if (slugAutoGen && draft.name) {
      const generated = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setDraft(prev => ({ ...prev, slug: generated }))
    }
  }, [draft.name, slugAutoGen])

  function set<K extends keyof Draft>(key: K, val: Draft[K]) {
    setDraft(prev => ({ ...prev, [key]: val }))
  }

  // Detect variables in base_prompt
  const varKeys = useMemo(() => {
    const regex = /\[([a-z0-9_]+)\]/gi
    const matches = [...(draft.base_prompt ?? '').matchAll(regex)]
    return [...new Set(matches.map(m => m[1].toLowerCase()))]
  }, [draft.base_prompt])

  // Field map: key → DraftField
  const fieldMap = useMemo(() => {
    const map: Record<string, DraftField> = {}
    for (const f of draft.fields) map[f.field_key] = f
    return map
  }, [draft.fields])

  // Fields not referenced in prompt
  const orphanFields = useMemo(
    () => draft.fields.filter(f => !varKeys.includes(f.field_key)),
    [draft.fields, varKeys]
  )

  const handleFieldSave = useCallback((key: string, updated: FieldRow) => {
    setDraft(prev => {
      const existing = prev.fields.findIndex(f => f.field_key === key || f._key === key)
      const draftField: DraftField = { ...updated, _key: updated.field_key }
      if (existing >= 0) {
        const next = [...prev.fields]
        next[existing] = draftField
        return { ...prev, fields: next }
      }
      return { ...prev, fields: [...prev.fields, draftField] }
    })
  }, [])

  // Compiled prompt preview
  const compiledPreview = useMemo(() => {
    return (draft.base_prompt ?? '').replace(/\[([a-z0-9_]+)\]/gi, (_m, k: string) => {
      const f = fieldMap[k.toLowerCase()]
      return f?.default_value ? `‹${f.default_value}›` : `[${k}]`
    })
  }, [draft.base_prompt, fieldMap])

  async function handleSave() {
    if (!draft.name.trim()) {
      setToast({ type: 'error', msg: 'Нэр шаардлагатай' })
      return
    }

    // Client-side validation: active + unconfigured variables
    if (draft.status === 'active') {
      const unconfigured = varKeys.filter(k => {
        const f = fieldMap[k]
        return !f || !f.prompt_mapping || !f.is_active
      })
      if (unconfigured.length > 0) {
        setToast({ type: 'error', msg: `Тохиргоогүй variables байна: ${unconfigured.map(k => `[${k}]`).join(', ')}` })
        setTab('prompt')
        return
      }
    }

    setSaving(true)
    setToast(null)

    // Build payload — all server-only fields included (they flow only through API)
    const payload = {
      preset: {
        name: draft.name,
        slug: draft.slug,
        category_id: draft.category_id || null,
        short_description: draft.short_description || null,
        full_description: draft.full_description || null,
        user_guide: draft.user_guide || null,
        thumbnail_url: draft.thumbnail_url || null,
        example_image_urls: draft.example_image_urls.filter(Boolean),
        credit_cost: draft.credit_cost,
        status: draft.status,
        sort_order: draft.sort_order,
        is_featured: draft.is_featured,
        is_trending: draft.is_trending,
        is_popular: draft.is_popular,
        is_new: draft.is_new,
        requires_image: draft.requires_image,
        min_image_count: draft.min_image_count,
        max_image_count: draft.max_image_count,
        allowed_file_types: draft.allowed_file_types,
        max_file_size_mb: draft.max_file_size_mb,
        upload_guide_text: draft.upload_guide_text || null,
        allowed_sizes: draft.allowed_sizes,
        output_count: draft.output_count,
        base_prompt: draft.base_prompt || null,
        negative_prompt: draft.negative_prompt || null,
        prompt_suffix: draft.prompt_suffix || null,
        quality_prompt: draft.quality_prompt || null,
        cleanup_prompt: draft.cleanup_prompt || null,
        internal_note: draft.internal_note || null,
        prompt_version: draft.prompt_version,
        primary_provider: draft.primary_provider,
        primary_model: draft.primary_model || null,
        fallback_provider: draft.fallback_provider || null,
        fallback_model: draft.fallback_model || null,
        quality_preset: draft.quality_preset,
        retry_limit: draft.retry_limit,
        cleanup_enabled: draft.cleanup_enabled,
        credit_override: draft.credit_override,
        credit_override_reason: draft.credit_override_reason || null,
      },
      fields: draft.fields.map(f => ({
        id: f.id,
        field_key: f.field_key,
        label: f.label,
        input_type: f.input_type,
        required: f.required,
        placeholder: f.placeholder,
        help_text: f.help_text,
        default_value: f.default_value,
        choices: f.choices,
        prompt_mapping: f.prompt_mapping,
        sort_order: f.sort_order,
        is_active: f.is_active,
      })),
    }

    try {
      const method = id === 'new' ? 'POST' : 'PUT'
      const url = `/api/admin/presets/${id}`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { ok?: boolean; id?: string; error?: string }

      if (!res.ok || json.error) {
        setToast({ type: 'error', msg: json.error ?? 'Алдаа гарлаа' })
      } else {
        setToast({ type: 'success', msg: 'Амжилттай хадгалагдлаа' })
        if (id === 'new' && json.id) {
          router.push(`/admin/presets/${json.id}`)
        }
      }
    } catch {
      setToast({ type: 'error', msg: 'Сервертэй холбогдоход алдаа гарлаа' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 62,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: toast.type === 'success' ? 'rgba(74,222,128,.15)' : 'rgba(239,68,68,.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
          color: toast.type === 'success' ? '#4ADE80' : '#EF4444',
          borderRadius: 10,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 500,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#E4E4E7' }}>
            {id === 'new' ? 'Шинэ Preset' : (draft.name || 'Preset засварлах')}
          </div>
          {draft.slug && (
            <div style={{ fontSize: 12, color: '#52525B', marginTop: 2 }}>/{draft.slug}</div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? 'rgba(124,58,237,.4)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 22px',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".3"/>
              <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/>
            </svg>
          )}
          Хадгалах
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,.06)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
              color: tab === t.key ? '#C4B5FD' : '#71717A',
              fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all .12s',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Үндсэн */}
      {tab === 'basic' && (
        <div>
          <Row>
            <Field flex={2}>
              <FL>Нэр <Req /></FL>
              <input style={INP_S} value={draft.name} onChange={e => set('name', e.target.value)} placeholder="Preset нэр" />
            </Field>
            <Field flex={2}>
              <FL>Slug</FL>
              <input
                style={INP_S}
                value={draft.slug}
                onChange={e => {
                  setSlugAutoGen(false)
                  set('slug', e.target.value)
                }}
                placeholder="preset-slug"
              />
            </Field>
            <Field flex={1}>
              <FL>Ангилал</FL>
              <DarkSelect value={draft.category_id} onChange={v => set('category_id', v)}>
                <option value="">— Сонгох —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </DarkSelect>
            </Field>
          </Row>

          <Row>
            <Field>
              <FL>Богино тайлбар</FL>
              <input style={INP_S} value={draft.short_description} onChange={e => set('short_description', e.target.value)} placeholder="Нэг өгүүлбэр тайлбар" />
            </Field>
          </Row>

          <Row>
            <Field>
              <FL>Дэлгэрэнгүй тайлбар</FL>
              <textarea style={{ ...TA_S, minHeight: 80 }} value={draft.full_description} onChange={e => set('full_description', e.target.value)} rows={3} />
            </Field>
          </Row>

          <Row>
            <Field>
              <FL>Хэрэглэгчийн гарын авлага</FL>
              <textarea style={{ ...TA_S, minHeight: 80 }} value={draft.user_guide} onChange={e => set('user_guide', e.target.value)} rows={3} />
            </Field>
          </Row>

          <Row>
            <Field flex={1}>
              <FL>Статус</FL>
              <DarkSelect value={draft.status} onChange={v => set('status', v)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </DarkSelect>
            </Field>
            <Field flex={1}>
              <FL>Sort Order</FL>
              <input style={INP_S} type="number" value={draft.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
            </Field>
          </Row>

          <SectionTitle>Тэмдэглэгээ</SectionTitle>
          <Row gap={20}>
            {(['is_featured', 'is_trending', 'is_popular', 'is_new'] as const).map(flag => (
              <CustomCheckbox
                key={flag}
                checked={draft[flag]}
                onChange={v => set(flag, v)}
                label={{ is_featured: 'Онцлох', is_trending: 'Trending', is_popular: 'Алдартай', is_new: 'Шинэ' }[flag]}
              />
            ))}
          </Row>

          <Divider />
          <SectionTitle>Зургийн шаардлага</SectionTitle>

          <Row>
            <CustomCheckbox
              checked={draft.requires_image}
              onChange={v => set('requires_image', v)}
              label="Зураг оруулах шаардлагатай"
            />
          </Row>

          {draft.requires_image && (
            <>
              <Row>
                <Field>
                  <FL>Хамгийн бага зургийн тоо</FL>
                  <input style={INP_S} type="number" min={0} value={draft.min_image_count} onChange={e => set('min_image_count', Number(e.target.value))} />
                </Field>
                <Field>
                  <FL>Хамгийн их зургийн тоо</FL>
                  <input style={INP_S} type="number" min={1} value={draft.max_image_count} onChange={e => set('max_image_count', Number(e.target.value))} />
                </Field>
                <Field>
                  <FL>Хамгийн их хэмжээ (MB)</FL>
                  <input style={INP_S} type="number" min={1} value={draft.max_file_size_mb} onChange={e => set('max_file_size_mb', Number(e.target.value))} />
                </Field>
              </Row>
              <div style={{ marginBottom: 16 }}>
                <FL>Зөвшөөрөгдсөн файлын төрөл</FL>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ALL_FILE_TYPES.map(ft => (
                    <ChipToggle
                      key={ft}
                      label={ft}
                      active={draft.allowed_file_types.includes(ft)}
                      onClick={() => {
                        const has = draft.allowed_file_types.includes(ft)
                        set('allowed_file_types', has
                          ? draft.allowed_file_types.filter(x => x !== ft)
                          : [...draft.allowed_file_types, ft])
                      }}
                    />
                  ))}
                </div>
              </div>
              <Row>
                <Field>
                  <FL>Зураг оруулах зааварчилгаа</FL>
                  <textarea style={{ ...TA_S, minHeight: 60 }} value={draft.upload_guide_text} onChange={e => set('upload_guide_text', e.target.value)} rows={2} />
                </Field>
              </Row>
            </>
          )}
        </div>
      )}

      {/* TAB: Модел */}
      {tab === 'model' && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>Primary Provider</SectionTitle>
            <Row gap={8}>
              <ChipToggle
                label="Gemini"
                active={draft.primary_provider === 'gemini'}
                onClick={() => set('primary_provider', 'gemini')}
                accent="#4ADE80"
              />
              <ChipToggle
                label="OpenAI"
                active={draft.primary_provider === 'openai'}
                onClick={() => set('primary_provider', 'openai')}
                accent="#4ADE80"
              />
            </Row>
            <Hint>Үндсэн AI үйлчилгээ. Gemini хямд, OpenAI чанар сайн. Эхэлж үүгээр оролдоно.</Hint>
            <Row>
              <Field>
                <FL>Primary Model</FL>
                <DarkSelect value={draft.primary_model} onChange={v => set('primary_model', v)}>
                  {draft.primary_provider === 'openai' ? (
                    <option value="gpt-image-1">gpt-image-1 — OpenAI, өндөр чанар</option>
                  ) : (
                    <>
                      <option value="gemini-2.5-flash-image">gemini-2.5-flash-image — Хурдан, тогтвортой, хямд</option>
                      <option value="gemini-3-pro-image">gemini-3-pro-image — Хамгийн сайн чанар</option>
                    </>
                  )}
                </DarkSelect>
                <Hint>Сонгосон provider-ийн ашиглах загвар. Gemini Flash нь хурдан бөгөөд найдвартай.</Hint>
              </Field>
            </Row>
          </Card>

          <Card>
            <SectionTitle>Тохиргоо</SectionTitle>
            <Row>
              <Field>
                <FL>Quality Preset</FL>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['standard', 'high', 'premium'] as const).map(q => (
                    <ChipToggle
                      key={q}
                      label={{ standard: 'Standard', high: 'High', premium: 'Premium' }[q]}
                      active={draft.quality_preset === q}
                      onClick={() => set('quality_preset', q)}
                    />
                  ))}
                </div>
              <Hint>Standard — хурдан, хямд. High — тэнцвэртэй. Premium — хамгийн сайн чанар, илүү credit зарцуулна.</Hint>
              </Field>
            </Row>
            <Row>
              <Field>
                <FL>Retry Limit</FL>
                <input style={INP_S} type="number" min={0} max={5} value={draft.retry_limit} onChange={e => set('retry_limit', Number(e.target.value))} onWheel={e => e.currentTarget.blur()} />
                <Hint>Амжилтгүй болоход хэдэн удаа дахин оролдох. Ихэвчлэн 1-2.</Hint>
              </Field>
              <Field>
                <FL>Output Count</FL>
                <input style={INP_S} type="number" min={1} max={4} value={draft.output_count} onChange={e => set('output_count', Number(e.target.value))} onWheel={e => e.currentTarget.blur()} />
                <Hint>Нэг удаад хэдэн зураг гаргах. Олон бол илүү credit зарцуулна.</Hint>
              </Field>
            </Row>
            <Row>
              <CustomCheckbox
                checked={draft.cleanup_enabled}
                onChange={v => set('cleanup_enabled', v)}
                label="Cleanup идэвхжүүлэх"
              />
            </Row>
            <Hint>AI-ийн нэмэлт artifact (буруу текст, гажуудал) цэвэрлэх дараагийн алхам. Чанар сайжруулна, бага зэрэг удаашруулна.</Hint>
            <div style={{ marginTop: 8 }}>
              <FL>Зөвшөөрөгдсөн хэмжээнүүд</FL>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_SIZES.map(sz => (
                  <ChipToggle
                    key={sz}
                    label={sz}
                    active={draft.allowed_sizes.includes(sz)}
                    onClick={() => {
                      const has = draft.allowed_sizes.includes(sz)
                      set('allowed_sizes', has
                        ? draft.allowed_sizes.filter(x => x !== sz)
                        : [...draft.allowed_sizes, sz])
                    }}
                  />
                ))}
              </div>
              <Hint>Хэрэглэгчид сонгож болох хэмжээнүүд. Хэмжээ нь зургийн композиц, текст байрлалд нөлөөлнө.</Hint>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Prompt & Fields */}
      {tab === 'prompt' && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <FL>Base Prompt</FL>
            <textarea
              style={{ ...MONO_S, minHeight: 120 }}
              value={draft.base_prompt}
              onChange={e => set('base_prompt', e.target.value)}
              rows={6}
              placeholder="Prompt text with [variable] placeholders..."
            />
            <div style={{ fontSize: 11, color: '#52525B', marginTop: 6 }}>
              Variable хэрэглэх: [variable_name] — жишээ нь [style], [mood], [subject]
            </div>
          </Card>

          {/* Variable fields */}
          {varKeys.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <SectionTitle>Prompt Variables ({varKeys.length})</SectionTitle>
              {varKeys.map(key => (
                <FieldAccordion
                  key={key}
                  varKey={key}
                  field={fieldMap[key] ?? null}
                  inPrompt={true}
                  onSave={handleFieldSave}
                />
              ))}
            </div>
          )}

          {/* Orphan fields */}
          {orphanFields.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <SectionTitle>Ашиглагдаагүй Fields ({orphanFields.length})</SectionTitle>
              {orphanFields.map(f => (
                <FieldAccordion
                  key={f.field_key}
                  varKey={f.field_key}
                  field={f}
                  inPrompt={false}
                  onSave={handleFieldSave}
                />
              ))}
            </div>
          )}

          <Divider />

          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>Нэмэлт Prompt тохиргоо</SectionTitle>
            <Row>
              <Field>
                <FL>Negative Prompt</FL>
                <textarea style={{ ...MONO_S, minHeight: 60 }} value={draft.negative_prompt} onChange={e => set('negative_prompt', e.target.value)} rows={2} />
              </Field>
            </Row>
            <Row>
              <Field>
                <FL>Quality Prompt</FL>
                <textarea style={{ ...MONO_S, minHeight: 60 }} value={draft.quality_prompt} onChange={e => set('quality_prompt', e.target.value)} rows={2} />
              </Field>
            </Row>
            <Row>
              <Field>
                <FL>Prompt Suffix</FL>
                <textarea style={{ ...MONO_S, minHeight: 60 }} value={draft.prompt_suffix} onChange={e => set('prompt_suffix', e.target.value)} rows={2} />
              </Field>
            </Row>
            <Row>
              <Field>
                <FL>Cleanup Prompt</FL>
                <textarea style={{ ...MONO_S, minHeight: 60 }} value={draft.cleanup_prompt} onChange={e => set('cleanup_prompt', e.target.value)} rows={2} />
              </Field>
            </Row>
            <Row>
              <Field flex={1}>
                <FL>Prompt Version</FL>
                <input style={INP_S} type="number" min={1} value={draft.prompt_version} onChange={e => set('prompt_version', Number(e.target.value))} />
              </Field>
              <Field flex={3}>
                <FL>Internal Note</FL>
                <input style={INP_S} value={draft.internal_note} onChange={e => set('internal_note', e.target.value)} placeholder="Дотоод тэмдэглэл..." />
              </Field>
            </Row>
          </Card>

          {/* Compiled preview */}
          {draft.base_prompt && (
            <Card>
              <SectionTitle>Compiled Prompt Preview</SectionTitle>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#A1A1AA',
                  background: 'rgba(0,0,0,.3)',
                  borderRadius: 6,
                  padding: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{
                  __html: compiledPreview
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/›([^‹]+)‹/g, '')
                    .replace(/‹([^›]+)›/g, '<span style="color:#C4B5FD;background:rgba(124,58,237,.15);padding:1px 4px;border-radius:3px">$1</span>'),
                }}
              />
            </Card>
          )}
        </div>
      )}

      {/* TAB: Зураг */}
      {tab === 'media' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 300 }}>
            <Card style={{ marginBottom: 16 }}>
              <SectionTitle>Thumbnail</SectionTitle>
              <ImageDropzone
                url={draft.thumbnail_url ?? ''}
                onUrl={url => set('thumbnail_url', url)}
                folder="presets/thumbnails"
                label="Thumbnail зураг"
              />
            </Card>

            <Card>
              <SectionTitle>Жишээ зурагнуудын URL (max 4)</SectionTitle>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <FL>Зураг {i + 1}</FL>
                  <ImageDropzone
                    url={draft.example_image_urls[i] ?? ''}
                    onUrl={url => {
                      const next = [...draft.example_image_urls]
                      next[i] = url
                      set('example_image_urls', next)
                    }}
                    folder="presets/examples"
                    label={`Жишээ зураг ${i + 1}`}
                  />
                </div>
              ))}
            </Card>
          </div>

          {/* Preview card */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <SectionTitle>Preview</SectionTitle>
            <div style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{
                height: 130,
                background: draft.thumbnail_url ? 'none' : 'linear-gradient(135deg,rgba(124,58,237,.2),rgba(236,72,153,.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {draft.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                )}
                {draft.is_featured && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(124,58,237,.9)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '.5px' }}>Онцлох</div>
                )}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', marginBottom: 4 }}>{draft.name || 'Preset нэр'}</div>
                <div style={{ fontSize: 11, color: '#71717A', marginBottom: 10, lineHeight: 1.4 }}>{draft.short_description || 'Тайлбар...'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: '#52525B' }}>{categories.find(c => c.id === draft.category_id)?.name ?? '—'}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD' }}>{draft.credit_cost} cr</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Credit */}
      {tab === 'credit' && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>Credit тохиргоо</SectionTitle>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 12 }}>Base Credit Cost</div>
              <input
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 12,
                  padding: '14px 24px',
                  color: '#C4B5FD',
                  fontSize: 32,
                  fontWeight: 800,
                  outline: 'none',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  width: 140,
                  boxSizing: 'border-box',
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={draft.credit_cost}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  set('credit_cost', v === '' ? 1 : Math.max(1, Number(v)))
                }}
                onWheel={e => e.currentTarget.blur()}
              />
              <Hint style={{ marginTop: 8 }}>Энэ preset-ийг ашиглахад хэрэглэгчээс хасах credit.</Hint>
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>Credit тооцоолол</SectionTitle>
            <div style={{ fontSize: 13, color: '#71717A', lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base cost</span>
                <span style={{ color: '#E4E4E7' }}>{draft.credit_cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Provider modifier</span>
                <span style={{ color: '#52525B' }}>+0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Quality modifier</span>
                <span style={{ color: '#52525B' }}>+0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Output count ({draft.output_count}x)</span>
                <span style={{ color: '#52525B' }}>+0</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: '#E4E4E7' }}>Нийт</span>
                <span style={{ color: '#C4B5FD', fontSize: 16 }}>{draft.credit_cost} cr</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Admin Override</SectionTitle>
            <Hint>Авто тооцоог үл хэрэгсэж credit-ийг гараар тогтоох. Шалтгаан заавал бичнэ.</Hint>
            <Row>
              <CustomCheckbox
                checked={draft.credit_override}
                onChange={v => set('credit_override', v)}
                label="Override идэвхжүүлэх"
              />
            </Row>
            {draft.credit_override && (
              <Row>
                <Field>
                  <FL>Override шалтгаан *</FL>
                  <textarea
                    style={{ ...TA_S, minHeight: 60 }}
                    value={draft.credit_override_reason}
                    onChange={e => set('credit_override_reason', e.target.value)}
                    placeholder="Override хийсэн шалтгаан..."
                    rows={2}
                  />
                </Field>
              </Row>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
