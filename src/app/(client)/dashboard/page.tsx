import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      {/* Welcome hero */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(124,58,237,.12) 0%,rgba(56,189,248,.06) 100%)',
        border: '1px solid rgba(124,58,237,.2)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 13, color: '#9D5FF5', fontWeight: 600, marginBottom: 8 }}>Тавтай морил</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Creato Studio</h1>
        <p style={{ fontSize: 14, color: '#A1A1AA', marginBottom: 20 }}>
          Prompt бичихгүйгээр AI зураг үүсгэ. Preset сонгоод эхэл.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/presets"
            style={{
              background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 0 18px rgba(124,58,237,.3)',
              display: 'inline-block',
            }}
          >
            Preset үзэх →
          </Link>
          <Link
            href="/credits"
            style={{
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.1)',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Credit авах
          </Link>
        </div>
      </div>
    </div>
  )
}
