'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ACard, APill, TH, TD } from './AdminTable'

interface CategoryRow {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
}

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

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const EMPTY: CategoryRow = {
  id: '',
  name: '',
  slug: '',
  sort_order: 0,
  is_active: true,
  created_at: '',
}

export default function AdminCategoriesClient({
  categories,
  presetCounts,
}: {
  categories: CategoryRow[]
  presetCounts: Record<string, number>
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState<Omit<CategoryRow, 'id' | 'created_at'>>({ name: '', slug: '', sort_order: 0, is_active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm({ name: '', slug: '', sort_order: categories.length, is_active: true })
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order, is_active: cat.is_active })
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setError('')
  }

  function onNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : toSlug(name) }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Нэр оруулна уу'); return }
    if (!form.slug.trim()) { setError('Slug оруулна уу'); return }
    setSaving(true)
    setError('')
    try {
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || json.error) { setError(json.error ?? 'Алдаа гарлаа'); return }
      closeModal()
      router.refresh()
    } catch {
      setError('Сервертэй холбогдох алдаа')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || json.error) { alert(json.error ?? 'Устгах алдаа'); return }
      setDeleteTarget(null)
      router.refresh()
    } catch {
      alert('Сервертэй холбогдох алдаа')
    } finally {
      setDeleting(false)
    }
  }

  const deleteCount = deleteTarget ? (presetCounts[deleteTarget.id] ?? 0) : 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7' }}>
          Ангилалууд <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({categories.length})</span>
        </h2>
        <button
          onClick={openCreate}
          style={{ background: '#7C3AED', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Ангилал нэмэх
        </button>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH>Нэр</TH>
              <TH>Slug</TH>
              <TH align="right">Preset тоо</TH>
              <TH>Статус</TH>
              <TH align="right">Sort</TH>
              <TH>Үүсгэсэн</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>
                  Ангилал байхгүй байна
                </td>
              </tr>
            ) : categories.map((cat, i) => (
              <tr
                key={cat.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,.04)', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <TD style={{ color: '#52525B', fontSize: 12 }}>{i + 1}</TD>
                <TD><span style={{ fontWeight: 600 }}>{cat.name}</span></TD>
                <TD><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#A1A1AA' }}>{cat.slug}</span></TD>
                <TD style={{ textAlign: 'right' }}>{presetCounts[cat.id] ?? 0}</TD>
                <TD>
                  <APill color={cat.is_active ? 'green' : 'gray'}>
                    {cat.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                  </APill>
                </TD>
                <TD style={{ textAlign: 'right', color: '#71717A' }}>{cat.sort_order}</TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>{formatDate(cat.created_at)}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEdit(cat)}
                      style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 6, padding: '4px 10px', color: '#C4B5FD', fontSize: 12, cursor: 'pointer' }}
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, padding: '4px 10px', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}
                    >
                      Устгах
                    </button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </ACard>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 460 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E4E4E7', marginBottom: 20 }}>
              {editing ? 'Ангилал засах' : 'Шинэ ангилал'}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Нэр</div>
              <input
                style={INP_S}
                value={form.name}
                onChange={e => onNameChange(e.target.value)}
                placeholder="Ангилалын нэр..."
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Slug</div>
              <input
                style={INP_S}
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="category-slug"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Sort Order</div>
              <input
                style={{ ...INP_S, width: 120 }}
                type="number"
                min={0}
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: form.is_active ? '#7C3AED' : 'rgba(255,255,255,.1)',
                    position: 'relative', cursor: 'pointer', transition: 'background .2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: form.is_active ? 18 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left .2s',
                  }} />
                </div>
                <span style={{ fontSize: 13, color: '#E4E4E7' }}>Идэвхтэй</span>
              </label>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, padding: '8px 12px', color: '#EF4444', fontSize: 12, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                disabled={saving}
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '8px 16px', color: '#A1A1AA', fontSize: 13, cursor: 'pointer' }}
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: '#7C3AED', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E4E4E7', marginBottom: 12 }}>
              Устгах уу?
            </div>
            <div style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 16, lineHeight: 1.6 }}>
              <strong style={{ color: '#E4E4E7' }}>{deleteTarget.name}</strong> ангилалыг устгах гэж байна.
              {deleteCount > 0 && (
                <div style={{ marginTop: 10, background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 6, padding: '8px 12px', color: '#FBBF24', fontSize: 12 }}>
                  Энэ ангилалд {deleteCount} preset байна. Устгавал тэдгээрийн ангилал null болно.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '8px 16px', color: '#A1A1AA', fontSize: 13, cursor: 'pointer' }}
              >
                Болих
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: '#EF4444', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Устгаж байна...' : 'Устгах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
