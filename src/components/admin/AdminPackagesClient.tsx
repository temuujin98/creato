'use client'

import { useState } from 'react'
import { ACard, APill, TH, TD } from './AdminTable'

interface PackageRow {
  id: string
  name: string
  credits: number
  price_mnt: number
  is_org: boolean
  sort_order: number
  is_active: boolean
}

interface FormState {
  name: string
  credits: number
  price_mnt: number
  is_org: boolean
  sort_order: number
  is_active: boolean
}

const BLANK: FormState = {
  name: '',
  credits: 100,
  price_mnt: 9900,
  is_org: false,
  sort_order: 0,
  is_active: true,
}

const INPUT: React.CSSProperties = {
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

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#52525B',
  textTransform: 'uppercase',
  letterSpacing: '.7px',
  marginBottom: 5,
  display: 'block',
}

function fmtMnt(n: number) {
  return '₮' + n.toLocaleString()
}

function ratio(credits: number, price: number) {
  if (!price) return '—'
  return `${credits} cr / ${fmtMnt(price)}`
}

export default function AdminPackagesClient({ packages: initial }: { packages: PackageRow[] }) {
  const [packages, setPackages] = useState<PackageRow[]>(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PackageRow | null>(null)
  const [form, setForm] = useState<FormState>(BLANK)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function openCreate() {
    setEditTarget(null)
    setForm(BLANK)
    setModalOpen(true)
  }

  function openEdit(pkg: PackageRow) {
    setEditTarget(pkg)
    setForm({
      name: pkg.name,
      credits: pkg.credits,
      price_mnt: pkg.price_mnt,
      is_org: pkg.is_org,
      sort_order: pkg.sort_order,
      is_active: pkg.is_active,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editTarget) {
        const res = await fetch(`/api/admin/packages/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json() as PackageRow
        setPackages(prev => prev.map(p => p.id === updated.id ? updated : p))
        showToast('Амжилттай шинэчиллээ', true)
      } else {
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const created = await res.json() as PackageRow
        setPackages(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order))
        showToast('Амжилттай нэмлээ', true)
      }
      setModalOpen(false)
    } catch {
      showToast('Хадгалахад алдаа гарлаа', false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(pkg: PackageRow) {
    if (!confirm(`"${pkg.name}" устгах уу?`)) return
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPackages(prev => prev.filter(p => p.id !== pkg.id))
      showToast('Устгасан', true)
    } catch {
      showToast('Устгахад алдаа гарлаа', false)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7' }}>
          Credit багцууд{' '}
          <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({packages.length})</span>
        </h2>
        <button
          onClick={openCreate}
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + Багц нэмэх
        </button>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH>Нэр</TH>
              <TH align="right">Credit</TH>
              <TH align="right">Үнэ</TH>
              <TH>Харьцаа</TH>
              <TH>Байгуулга</TH>
              <TH align="right">Sort</TH>
              <TH>Статус</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>
                  Багц олдсонгүй
                </td>
              </tr>
            ) : packages.map((pkg, i) => (
              <tr
                key={pkg.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .12s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                <TD style={{ fontWeight: 500 }}>{pkg.name}</TD>
                <TD style={{ textAlign: 'right', fontWeight: 700, color: '#C4B5FD' }}>{pkg.credits.toLocaleString()}</TD>
                <TD style={{ textAlign: 'right', fontWeight: 600, color: '#4ADE80' }}>{fmtMnt(pkg.price_mnt)}</TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>{ratio(pkg.credits, pkg.price_mnt)}</TD>
                <TD>
                  {pkg.is_org
                    ? <APill color="blue">Байгуулга</APill>
                    : <APill color="gray">Хувь</APill>}
                </TD>
                <TD style={{ textAlign: 'right', color: '#52525B' }}>{pkg.sort_order}</TD>
                <TD>
                  <APill color={pkg.is_active ? 'green' : 'gray'}>
                    {pkg.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                  </APill>
                </TD>
                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEdit(pkg)}
                      style={{
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.07)',
                        color: '#A1A1AA',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => handleDelete(pkg)}
                      style={{
                        background: 'rgba(239,68,68,.08)',
                        border: '1px solid rgba(239,68,68,.2)',
                        color: '#EF4444',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
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

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#0E0E18',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 440,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E4E4E7', marginBottom: 20 }}>
              {editTarget ? 'Багц засах' : 'Шинэ багц нэмэх'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>Нэр</label>
                <input
                  style={INPUT}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Starter Pack..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Credit тоо</label>
                  <input
                    type="number"
                    style={INPUT}
                    value={form.credits}
                    onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                    min={1}
                  />
                </div>
                <div>
                  <label style={LABEL}>Үнэ (₮)</label>
                  <input
                    type="number"
                    style={INPUT}
                    value={form.price_mnt}
                    onChange={e => setForm(f => ({ ...f, price_mnt: Number(e.target.value) }))}
                    min={0}
                  />
                </div>
              </div>

              {form.credits > 0 && form.price_mnt > 0 && (
                <p style={{ fontSize: 12, color: '#71717A', margin: '-6px 0 0' }}>
                  Харьцаа: <span style={{ color: '#C4B5FD' }}>{ratio(form.credits, form.price_mnt)}</span>
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Sort order</label>
                  <input
                    type="number"
                    style={INPUT}
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#E4E4E7' }}>
                  <input
                    type="checkbox"
                    checked={form.is_org}
                    onChange={e => setForm(f => ({ ...f, is_org: e.target.checked }))}
                    style={{ accentColor: '#7C3AED', width: 14, height: 14 }}
                  />
                  Байгуулгад зориулсан
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#E4E4E7' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    style={{ accentColor: '#7C3AED', width: 14, height: 14 }}
                  />
                  Идэвхтэй
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.07)',
                  color: '#A1A1AA',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: !form.name.trim() ? 0.5 : 1,
                }}
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
