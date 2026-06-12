import Link from 'next/link'

export interface HeroProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

export default function Hero({ isVisible = true }: HeroProps) {
  if (!isVisible) return null
  return (
    <section style={{ position: 'relative', padding: '154px 0 96px', overflow: 'hidden' }} className="gridded-hero">
      {/* glow */}
      <div style={{ position: 'absolute', width: 1100, height: 720, top: -220, left: '50%', transform: 'translateX(-34%)', background: 'radial-gradient(ellipse,rgba(124,58,237,.16) 0%,rgba(34,211,238,.04) 45%,transparent 70%)', pointerEvents: 'none' }} className="hero-glow-anim" />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div className="hero-grid-layout">
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 8, padding: '7px 14px', fontFamily: "'Roboto Mono',monospace", fontSize: 11.5, fontWeight: 500, letterSpacing: '.5px', color: '#C4B5FD', marginBottom: 30 }}>
              <span className="dot-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 8px #22D3EE', display: 'inline-block' }} />
              PROMPT-FREE AI STUDIO · МОНГОЛД
            </div>

            <h1 style={{ fontSize: 'clamp(42px,5.4vw,66px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-3px', marginBottom: 24, color: '#F5F4FA' }}>
              Prompt бичихгүй.<br />
              <span style={{ background: 'linear-gradient(100deg,#C4B5FD 0%,#8B5CF6 45%,#E879F9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Visual бэлэн.
              </span>
            </h1>

            <p style={{ fontSize: 16.5, lineHeight: 1.75, color: '#8E8C9E', maxWidth: 430, marginBottom: 34 }}>
              Бэлэн <strong style={{ color: '#F5F4FA', fontWeight: 600 }}>preset</strong> сонгоод зураг, текст, өнгөө оруулахад л AI таны бизнесийн visual-ыг үүсгэнэ. <strong style={{ color: '#F5F4FA', fontWeight: 600 }}>Prompt мэдэх шаардлагагүй.</strong>
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
              <Link href="/presets" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15.5, fontWeight: 600, padding: '16px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 0 1px rgba(196,181,253,.25) inset,0 4px 24px rgba(124,58,237,.35)' }}>
                Preset үзэх <ArrowIcon />
              </Link>
              <a href="#how" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15.5, fontWeight: 600, padding: '16px 32px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#F5F4FA', textDecoration: 'none' }}>
                Яаж ажилладаг вэ
              </a>
            </div>

            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 11.5, color: '#4A4858', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {'> '}
              <b style={{ color: '#8E8C9E', fontWeight: 500 }}>preset.сонгох</b>
              <span style={{ color: '#8B5CF6' }}>→</span>
              <b style={{ color: '#8E8C9E', fontWeight: 500 }}>мэдээлэл.оруулах</b>
              <span style={{ color: '#8B5CF6' }}>→</span>
              <b style={{ color: '#8E8C9E', fontWeight: 500 }}>visual.бэлэн</b>
              <span className="cursor-blink" style={{ display: 'inline-block', width: 7, height: 13, background: '#C4B5FD', verticalAlign: '-2px' }} />
            </div>
          </div>

          {/* Right — generation engine console */}
          <div className="console-parallax" style={{ position: 'relative', background: 'rgba(12,11,26,.85)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.55),0 0 0 1px rgba(139,92,246,.06)', backdropFilter: 'blur(6px)' }}>
            {/* corner ticks */}
            <span className="con-tick con-tick-tl" />
            <span className="con-tick con-tick-tr" />
            <span className="con-tick con-tick-bl" />
            <span className="con-tick con-tick-br" />

            {/* bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.015)' }}>
              <span style={{ display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => <i key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'inline-block' }} />)}
              </span>
              <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 11, color: '#4A4858', letterSpacing: '.5px' }}>creato — generation.engine</span>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, fontWeight: 500, color: '#4ADE80', letterSpacing: 1 }}>
                <i className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px rgba(74,222,128,.8)', display: 'inline-block' }} />
                LIVE
              </span>
            </div>

            {/* body: input → core → output */}
            <div className="con-body-grid">
              {/* Input */}
              <div>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, fontWeight: 500, letterSpacing: 2, color: '#4A4858', marginBottom: 10, textTransform: 'uppercase' }}>Input</div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'rgba(139,92,246,.09)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 9, marginBottom: 12 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(150deg,#2D0A4E,#7C3AED 60%,#E879F9)', flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'block' }}>
                      <span style={{ position: 'absolute', bottom: 4, left: 4, right: 10, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.55)', display: 'block' }} />
                    </span>
                    <span>
                      <b style={{ fontSize: 12, fontWeight: 700, display: 'block', lineHeight: 1.25, color: '#F5F4FA' }}>Sale постер</b>
                      <small style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: '#C4B5FD', letterSpacing: 1, textTransform: 'uppercase' }}>preset</small>
                    </span>
                  </div>
                  {[['нэр','Lhamour'],['өнгө','violet'],['хэмжээ','4:5']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Roboto Mono',monospace", fontSize: 11, padding: '7px 2px', borderBottom: '1px dashed rgba(255,255,255,.07)' }}>
                      <span style={{ color: '#4A4858' }}>{k}</span>
                      <b style={{ color: '#F5F4FA', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {k === 'өнгө' && <span style={{ width: 10, height: 10, borderRadius: 3, background: '#8B5CF6', boxShadow: '0 0 6px rgba(139,92,246,.7)', display: 'inline-block' }} />}
                        {v}
                      </b>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core */}
              <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="beam beam-l" />
                <div style={{ position: 'relative', width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="c-ring" />
                  <span className="c-ring2" />
                  <span className="c-in" style={{ width: 42, height: 42, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%,#A78BFA,#5B21B6 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 1, boxShadow: '0 0 26px rgba(139,92,246,.55)', position: 'relative', zIndex: 2 }}>AI</span>
                </div>
                <span className="beam beam-r" />
              </div>

              {/* Output */}
              <div>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, fontWeight: 500, letterSpacing: 2, color: '#4A4858', marginBottom: 10, textTransform: 'uppercase' }}>Output</div>
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(196,181,253,.22)', aspectRatio: '4/4.6', background: 'linear-gradient(165deg,#1E1145 0%,#3B1D8A 45%,#7C3AED 82%,#C4B5FD 115%)' }}>
                  <div style={{ position: 'absolute', top: 14, left: 14, fontFamily: "'Roboto Mono',monospace", fontSize: 8.5, letterSpacing: 2.5, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase' }}>Creato · Sale poster</div>
                  <div style={{ position: 'absolute', top: 38, left: 14, right: 14, fontSize: 32, fontWeight: 900, lineHeight: .95, letterSpacing: '-1.5px', color: '#fff' }}>
                    ШИНЭ<br />ХЯМДРАЛ
                    <small style={{ display: 'block', fontSize: 11.5, fontWeight: 400, letterSpacing: 0, color: 'rgba(255,255,255,.65)', marginTop: 8, lineHeight: 1.45 }}>Намрын цуглуулга — зөвхөн энэ долоо хоногт</small>
                  </div>
                  <div style={{ position: 'absolute', bottom: -34, right: -26, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),rgba(255,255,255,.05) 60%)', filter: 'blur(1px)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, background: '#fff', color: '#1E1145', fontSize: 14, fontWeight: 900, padding: '6px 13px', borderRadius: 8, letterSpacing: '-.5px' }}>-40%</div>
                  <div className="scan-anim" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11, fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, color: '#8E8C9E' }}>
                  <i style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px rgba(74,222,128,.7)', flexShrink: 0, display: 'inline-block' }} />
                  <b style={{ color: '#4ADE80', fontWeight: 500 }}>Амжилттай</b>
                  <span style={{ color: '#4A4858' }}>·</span>1 credit
                  <span style={{ color: '#4A4858' }}>·</span>14.2 сек
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gridded-hero::before{content:'';position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(139,92,246,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.05) 1px,transparent 1px);
          background-size:44px 44px;
          -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000 20%,transparent 75%);
          mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000 20%,transparent 75%)}
        .hero-grid-layout{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;position:relative;z-index:1}
        @media(max-width:1024px){.hero-grid-layout{grid-template-columns:1fr;gap:56px}.console-parallax{max-width:560px;margin:0 auto}}
        .hero-glow-anim{animation:glowDrift 14s ease-in-out infinite alternate}
        @keyframes glowDrift{from{transform:translateX(-38%) translateY(0)}to{transform:translateX(-28%) translateY(26px)}}
        .dot-blink{animation:blink 2.2s ease-in-out infinite}
        .cursor-blink{animation:blink 1.1s steps(1) infinite}
        .live-dot{animation:blink 1.8s ease-in-out infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}

        .con-tick{position:absolute;width:14px;height:14px;border-color:rgba(139,92,246,.25);border-style:solid;z-index:6;pointer-events:none}
        .con-tick-tl{top:-1px;left:-1px;border-width:2px 0 0 2px;border-radius:16px 0 0 0}
        .con-tick-tr{top:-1px;right:-1px;border-width:2px 2px 0 0;border-radius:0 16px 0 0}
        .con-tick-bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px;border-radius:0 0 0 16px}
        .con-tick-br{bottom:-1px;right:-1px;border-width:0 2px 2px 0;border-radius:0 0 16px 0}

        .con-body-grid{display:grid;grid-template-columns:186px 88px 1fr;align-items:center;padding:22px 20px}
        @media(max-width:768px){
          .con-body-grid{grid-template-columns:1fr;gap:0;padding:18px 16px}
          .con-body-grid>div:nth-child(2){height:84px!important}
        }

        .beam{position:absolute;top:50%;height:2px;width:26px;margin-top:-1px;
          background:repeating-linear-gradient(90deg,#8B5CF6 0 5px,transparent 5px 10px);
          background-size:10px 2px;opacity:.8;animation:beamFlow 1s linear infinite}
        .beam-l{left:-4px}
        .beam-r{right:-4px;animation-delay:.5s}
        @keyframes beamFlow{from{background-position:0 0}to{background-position:10px 0}}
        @media(max-width:768px){
          .beam{width:2px;height:22px;margin-top:0;top:auto;
            background:repeating-linear-gradient(180deg,#8B5CF6 0 5px,transparent 5px 10px);
            background-size:2px 10px;animation-name:beamFlowV}
          .beam-l{left:50%;top:-4px;margin-left:-1px}
          .beam-r{right:auto;left:50%;bottom:-4px;margin-left:-1px}
        }
        @keyframes beamFlowV{from{background-position:0 0}to{background-position:0 10px}}

        .c-ring{position:absolute;inset:0;border-radius:50%;
          background:conic-gradient(from 0deg,transparent 0%,#8B5CF6 25%,#E879F9 50%,transparent 75%);
          -webkit-mask:radial-gradient(circle,transparent 56%,#000 58%);
          mask:radial-gradient(circle,transparent 56%,#000 58%);
          animation:spin 3.2s linear infinite}
        .c-ring2{position:absolute;inset:-9px;border-radius:50%;border:1px dashed rgba(139,92,246,.25);animation:spin 9s linear infinite reverse}
        @keyframes spin{to{transform:rotate(360deg)}}
        .c-in{animation:corePulse 2.4s ease-in-out infinite}
        @keyframes corePulse{0%,100%{box-shadow:0 0 22px rgba(139,92,246,.45)}50%{box-shadow:0 0 40px rgba(139,92,246,.85)}}

        .scan-anim{position:absolute;left:0;right:0;height:54px;top:-60px;
          background:linear-gradient(180deg,transparent,rgba(34,211,238,.14) 50%,rgba(34,211,238,.4) 96%,transparent);
          border-bottom:1px solid rgba(34,211,238,.55);
          animation:scanMove 4.5s cubic-bezier(.5,0,.5,1) infinite;pointer-events:none}
        @keyframes scanMove{0%{top:-60px;opacity:0}8%{opacity:1}80%{top:104%;opacity:1}100%{top:104%;opacity:0}}

        @media(prefers-reduced-motion:reduce){
          .hero-glow-anim,.c-ring,.c-ring2,.c-in,.scan-anim,.beam,.dot-blink,.cursor-blink,.live-dot{animation:none!important}
        }
      `}</style>
    </section>
  )
}

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
