import Link from 'next/link'

export interface FinalCtaProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

export default function FinalCta({ title = 'Өнөөдрөөс эхлэ. Prompt хэрэгтэй гүй.', isVisible = true }: FinalCtaProps) {
  if (!isVisible) return null
  return (
    <section style={{ padding: '80px 28px 104px', background: '#07060F' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#1A1030 0%,#0F0C22 50%,#160B28 100%)', border: '1px solid rgba(139,92,246,.25)', padding: 'clamp(40px,6vw,72px) clamp(28px,5vw,64px)', textAlign: 'center' }}>
          {/* grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.06) 1px,transparent 1px)', backgroundSize: '44px 44px', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,#000 20%,transparent 75%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,#000 20%,transparent 75%)', pointerEvents: 'none' }} />
          {/* glow */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(139,92,246,.25) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(232,121,249,.15) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(16px)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', background: 'rgba(232,121,249,.08)', border: '1px solid rgba(232,121,249,.2)', borderRadius: 8, padding: '6px 14px', marginBottom: 26 }}>
              <span className="fta-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#E879F9', boxShadow: '0 0 8px rgba(232,121,249,.8)', display: 'inline-block', animation: 'blink 1.4s ease-in-out infinite' }} />
              Одоо нэгдэ
            </div>

            <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, color: '#F5F4FA', marginBottom: 18 }}>{title}</h2>
            <p style={{ fontSize: 15, color: '#8E8C9E', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Бүртгүүлснээр нэг туршилтын credit авна. Карт шаардлагагүй.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 0 1px rgba(196,181,253,.25) inset,0 8px 32px rgba(124,58,237,.45)', transition: 'all .2s' }}>
                Үнэгүй эхлэх
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/presets" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, padding: '14px 26px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#C4B5FD', textDecoration: 'none', transition: 'all .2s' }}>
                Preset харах
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
              {['Карт шаардлагагүй', '1 туршилтын credit', 'Монгол хэл'].map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8E8C9E' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @media(prefers-reduced-motion:reduce){.fta-dot{animation:none}}
      `}</style>
    </section>
  )
}
