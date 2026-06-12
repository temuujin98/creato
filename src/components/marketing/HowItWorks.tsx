export interface HowItWorksProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const STEPS = [
  { n: '01', t: 'Preset сонгоно', d: 'Sale poster, product photo, меню гэх мэт бэлэн preset-ээс сонго.', chip: 'Олон төрлийн preset', chipColor: '#A78BFA', chipIcon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg> },
  { n: '02', t: 'Мэдээллээ оруулна', d: 'Зураг upload хийж, нэр, өнгө, хэмжээгээ сонго. Бичих зүйл бараг байхгүй.', chip: 'Зураг + сонголт', chipColor: '#E879F9', chipIcon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E879F9" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  { n: '03', t: 'AI үүсгэнэ', d: 'Credit зарцуулаад AI хэдхэн секундэд таны visual-ыг бүтээнэ.', chip: '~15 секунд', chipColor: '#38BDF8', chipIcon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg> },
  { n: '04', t: 'Татаж ашиглана', d: 'HD чанартай татаж аваад постоо хийгээрэй. My Images-д хадгалагдана.', chip: 'HD татах', chipColor: '#4ADE80', chipIcon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
]

export default function HowItWorks({ title = '4 алхам. Prompt байхгүй.', isVisible = true }: HowItWorksProps) {
  if (!isVisible) return null
  return (
    <section id="how" style={{ padding: '104px 0', background: '#0C0B1A', position: 'relative' }} className="gridded-sec">
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 14 }}>
            <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Процесс<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
          </div>
          <h2 style={{ fontSize: 'clamp(30px,3.6vw,46px)', fontWeight: 900, letterSpacing: '-1.8px', lineHeight: 1.05, color: '#F5F4FA' }}>{title}</h2>
        </div>

        <div className="flow-grid">
          {STEPS.map((s, i) => (
            <div key={i} className={`fstep sr${i > 0 ? ` sr-d${i}` : ''}`} style={{ position: 'relative', zIndex: 1, background: '#12101F', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '26px 22px', transition: 'transform .3s cubic-bezier(.34,1.3,.5,1),border-color .3s' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Roboto Mono',monospace", fontSize: 13, fontWeight: 700, color: '#C4B5FD', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 9, padding: '9px 14px', marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,.8)', display: 'inline-block' }} />
                {s.n}
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 8, color: '#F5F4FA' }}>{s.t}</div>
              <div style={{ fontSize: 12.5, color: '#8E8C9E', lineHeight: 1.7, marginBottom: 14 }}>{s.d}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'Roboto Mono',monospace", fontSize: 10, fontWeight: 500, color: '#8E8C9E', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '5px 10px' }}>
                {s.chipIcon} {s.chip}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .gridded-sec::before{content:'';position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(139,92,246,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.05) 1px,transparent 1px);
          background-size:44px 44px;
          -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000 20%,transparent 75%);
          mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000 20%,transparent 75%)}
        .flow-grid{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .flow-grid::before{content:'';position:absolute;top:34px;left:9%;right:9%;height:2px;
          background:repeating-linear-gradient(90deg,rgba(139,92,246,.25) 0 7px,transparent 7px 14px);
          background-size:14px 2px;z-index:0;animation:beamFlow 1.2s linear infinite}
        @media(max-width:1024px){.flow-grid{grid-template-columns:repeat(2,1fr)}.flow-grid::before{display:none}}
        @media(max-width:768px){.flow-grid{grid-template-columns:1fr}}
        .fstep:hover{transform:translateY(-5px);border-color:rgba(139,92,246,.25)!important}
        @keyframes beamFlow{from{background-position:0 0}to{background-position:14px 0}}
        @media(prefers-reduced-motion:reduce){.flow-grid::before{animation:none}}
      `}</style>
    </section>
  )
}
