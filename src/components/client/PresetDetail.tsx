import Link from 'next/link'
import type { PresetPublic, PresetFieldPublic } from '@/types/preset'

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

interface PresetDetailProps {
  preset: PresetPublic
  fields: PresetFieldPublic[]
  isAuthenticated: boolean
}

export default function PresetDetail({ preset, fields, isAuthenticated }: PresetDetailProps) {
  const heroGrad = GRAD_THUMBS[0]
  const exampleGrads = [0, 1, 2, 3].map(i => GRAD_THUMBS[i % GRAD_THUMBS.length])

  function getBadgeLabel(): string | null {
    if (preset.is_featured) return 'Онцлох'
    if (preset.is_new) return 'Шинэ'
    if (preset.is_trending) return 'Тренд'
    return null
  }

  const badgeLabel = getBadgeLabel()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back button */}
      <Link
        href="/presets"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#A1A1AA',
          cursor: 'pointer',
          fontSize: 14,
          fontFamily: 'inherit',
          marginBottom: 24,
          textDecoration: 'none',
        }}
      >
        ← Буцах
      </Link>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Hero thumbnail */}
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, aspectRatio: '16/9', background: heroGrad, position: 'relative' }}>
            {badgeLabel && (
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(124,58,237,.2)',
                  border: '1px solid rgba(124,58,237,.4)',
                  borderRadius: 100,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#C4B5FD',
                }}>
                  {badgeLabel}
                </span>
              </div>
            )}
          </div>

          {/* Example outputs */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA', marginBottom: 10 }}>Жишээ гаралтууд</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
            {exampleGrads.map((g, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 10, background: g, border: '1px solid rgba(255,255,255,.07)' }} />
            ))}
          </div>

          {/* Description */}
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Тайлбар</h3>
            <p style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 1.7 }}>
              {preset.long_description ?? preset.short_description ?? 'Тайлбар байхгүй байна.'}
            </p>
          </div>

          {/* Required inputs */}
          {fields.length > 0 && (
            <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Шаардлагатай оролт</h3>
              {fields.map((f, i) => (
                <div key={f.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {f.label}
                      {f.is_required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#52525B', marginTop: 2 }}>{f.field_type}</div>
                    {f.help_text && <div style={{ fontSize: 12, color: '#71717A', marginTop: 4 }}>{f.help_text}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 24, marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 6 }}>{preset.name}</h2>
            {preset.category_name && (
              <div style={{ fontSize: 12, color: '#52525B', marginBottom: 14 }}>{preset.category_name}</div>
            )}

            {/* Credit cost box */}
            <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9D5FF5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                Credit зарцуулалт
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                <span>Нийт</span>
                <span style={{ color: '#9D5FF5' }}>{preset.credit_cost} cr</span>
              </div>
            </div>

            {/* Generate button */}
            {isAuthenticated ? (
              <Link
                href={`/presets/${preset.slug}/generate`}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(124,58,237,.35)',
                  fontFamily: 'inherit',
                  marginBottom: 10,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Үүсгэж эхлэх →
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(124,58,237,.35)',
                  fontFamily: 'inherit',
                  marginBottom: 10,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Нэвтэрч эхлэх →
              </Link>
            )}

            {/* Back button */}
            <Link
              href="/presets"
              style={{
                display: 'block',
                width: '100%',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.08)',
                color: '#A1A1AA',
                borderRadius: 10,
                padding: '11px',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
