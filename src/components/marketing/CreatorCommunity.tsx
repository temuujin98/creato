import Link from 'next/link'

export interface CreatorCommunityProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const STEPS = [
  { n: '1', t: 'Preset-ээ бүтээ', d: 'Өөрийн загвар, стилийг preset болгон хадгал.' },
  { n: '2', t: 'Хянагдаад нийтлэгдэнэ', d: 'Админ баталгаажуулсны дараа каталогт орно.' },
  { n: '3', t: 'Reward credit ав', d: 'Бусад хэрэглэгч таны preset ашиглах бүрд урамшуулал авна.' },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg,#8B5CF6,#E879F9)',
  'linear-gradient(135deg,#0EA5E9,#22D3EE)',
  'linear-gradient(135deg,#F59E0B,#FBBF24)',
  'linear-gradient(135deg,#22C55E,#4ADE80)',
]

export default function CreatorCommunity({ title = 'Өөрийн preset-ээ үүсгээд бусдад ашиглуул', isVisible = true }: CreatorCommunityProps) {
  if (!isVisible) return null
  return (
    <section style={{ padding: '104px 0', background: '#0C0B1A' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div className="creator-grid">
          {/* LEFT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 16 }}>
              <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Creator community<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3.2vw,40px)', fontWeight: 900, letterSpacing: '-1.6px', lineHeight: 1.1, color: '#F5F4FA', margin: '0 0 28px' }}>{title}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Roboto Mono',monospace", fontSize: 11.5, fontWeight: 700, color: '#C4B5FD', flexShrink: 0, marginTop: 2 }}>{s.n}</span>
                  <div>
                    <b style={{ fontSize: 14, fontWeight: 700, display: 'block', letterSpacing: '-.2px', color: '#F5F4FA' }}>{s.t}</b>
                    <span style={{ fontSize: 12.5, color: '#8E8C9E', lineHeight: 1.6 }}>{s.d}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/register" style={{ marginTop: 30, display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, padding: '11px 22px', borderRadius: 11, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#F5F4FA', textDecoration: 'none', transition: 'all .2s' }}>
              Creator болох
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          {/* RIGHT — cr-visual */}
          <div style={{ position: 'relative', height: 360 }}>
            {/* main preset card */}
            <div style={{ position: 'absolute', width: 250, left: '50%', top: 30, marginLeft: -125, zIndex: 2, background: '#161427', border: '1px solid rgba(139,92,246,.25)', borderRadius: 14, padding: 16, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>
              <div style={{ height: 120, borderRadius: 10, background: 'linear-gradient(150deg,#2D0A4E,#7C3AED,#E879F9)', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', bottom: 10, left: 12, fontFamily: "'Roboto Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#fff' }}>МИНИЙ PRESET</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: '#F5F4FA' }}>Neon sale загвар</div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, color: '#8E8C9E', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#E879F9)', display: 'inline-block', flexShrink: 0 }} />
                @bolor_design · Creator
              </div>
            </div>

            {/* reward card */}
            <div className="crv-reward" style={{ position: 'absolute', right: 8, bottom: 46, zIndex: 3, background: '#161427', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </span>
              <div>
                <b style={{ fontSize: 12.5, display: 'block', color: '#F5F4FA' }}>Reward credit</b>
                <span style={{ fontSize: 10.5, color: '#8E8C9E' }}>Ашиглалт бүрд</span>
              </div>
            </div>

            {/* users card */}
            <div className="crv-users" style={{ position: 'absolute', left: 6, bottom: 80, zIndex: 3, background: '#161427', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>
              <div style={{ display: 'flex', marginBottom: 7 }}>
                {AVATAR_COLORS.map((bg, i) => (
                  <span key={i} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #161427', marginLeft: i === 0 ? 0 : -7, background: bg, display: 'inline-block' }} />
                ))}
              </div>
              <span style={{ fontSize: 10.5, color: '#8E8C9E' }}>Хэрэглэгчид ашиглаж байна</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .creator-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
        @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .crv-reward{animation:floatC 6s ease-in-out infinite}
        .crv-users{animation:floatC 7s ease-in-out .6s infinite}
        @media(max-width:900px){.creator-grid{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){.crv-reward,.crv-users{animation:none}}
      `}</style>
    </section>
  )
}
