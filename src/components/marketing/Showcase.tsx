export interface ShowcaseProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const ITEMS = [
  { key: 'sale', label: 'Sale poster', cat: 'Зарлал', accent: '#E879F9', big: true },
  { key: 'prod', label: 'Product photo', cat: 'Бүтээгдэхүүн', accent: '#38BDF8', big: false },
  { key: 'food', label: 'Food menu', cat: 'Хоол, ресторан', accent: '#FBBF24', big: false },
  { key: 'beauty', label: 'Beauty promo', cat: 'Гоо сайхан', accent: '#F9A8D4', big: false },
  { key: 'ban', label: 'Banner ad', cat: 'Реклам', accent: '#4ADE80', big: false },
]

function Thumb({ item, big }: { item: typeof ITEMS[0], big: boolean }) {
  const s = big
    ? { width: '100%', height: '100%', minHeight: 340 }
    : { width: '100%', height: '100%', minHeight: 160 }
  return (
    <div className="sc-item" style={{
      position: 'relative', overflow: 'hidden', borderRadius: big ? 14 : 12,
      border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer',
      transition: 'transform .3s cubic-bezier(.34,1.3,.5,1),border-color .3s,box-shadow .3s',
      ...s,
    }}>
      {/* gradient bg */}
      <div style={{ position: 'absolute', inset: 0, background: big
        ? `radial-gradient(ellipse 70% 80% at 50% 30%,${item.accent}22 0%,#07060F 70%)`
        : `radial-gradient(ellipse 80% 70% at 50% 40%,${item.accent}18 0%,#0C0B1A 75%)`,
        zIndex: 0 }} />

      {/* mockup content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: big ? 36 : 20 }}>
        {big ? (
          <>
            <div style={{ width: 90, height: 90, borderRadius: 18, background: `linear-gradient(135deg,${item.accent}55,${item.accent}22)`, border: `1px solid ${item.accent}44`, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${item.accent}33`, border: `2px solid ${item.accent}88` }} />
            </div>
            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, color: item.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Шилдэг дизайн</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: '#F5F4FA', textAlign: 'center', marginBottom: 8 }}>Таны брэнд<br/>гэрэлтэнэ</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: item.accent, letterSpacing: '-1.5px' }}>-40%</div>
          </>
        ) : (
          <>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.accent}22`, border: `1px solid ${item.accent}44`, marginBottom: 12 }} />
            <div style={{ width: '70%', height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: '50%', height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 4 }} />
          </>
        )}
      </div>

      {/* overlay label */}
      <div style={{ position: 'absolute', bottom: big ? 20 : 12, left: big ? 20 : 12, zIndex: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, fontWeight: 500, color: '#8E8C9E', background: 'rgba(7,6,15,.8)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '4px 8px' }}>{item.cat}</span>
      </div>

      {/* scan overlay */}
      <div className="sc-scan" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0, transition: 'opacity .3s', background: `linear-gradient(180deg,transparent 0%,${item.accent}08 50%,transparent 100%)` }} />
    </div>
  )
}

export default function Showcase({ title = 'Жишээ бүтээлүүд', isVisible = true }: ShowcaseProps) {
  if (!isVisible) return null
  return (
    <section id="showcase" style={{ padding: '104px 0', background: '#07060F', position: 'relative' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 12 }}>
              <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Showcase<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px,3.2vw,42px)', fontWeight: 900, letterSpacing: '-1.6px', lineHeight: 1.05, color: '#F5F4FA', margin: 0 }}>{title}</h2>
          </div>
          <a href="/presets" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#8B5CF6', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 10, padding: '9px 16px', textDecoration: 'none', transition: 'all .2s' }}>
            Бүх preset харах
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <div className="sc-grid">
          <div className="sc-big"><Thumb item={ITEMS[0]} big={true} /></div>
          <div className="sc-small-grid">
            {ITEMS.slice(1).map(item => <Thumb key={item.key} item={item} big={false} />)}
          </div>
        </div>
      </div>

      <style>{`
        .sc-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:14px;align-items:stretch}
        .sc-big{min-height:380px}
        .sc-small-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .sc-item:hover{transform:translateY(-4px)!important;border-color:rgba(139,92,246,.25)!important;box-shadow:0 12px 48px rgba(0,0,0,.45)!important}
        .sc-item:hover .sc-scan{opacity:1!important}
        @media(max-width:900px){.sc-grid{grid-template-columns:1fr}.sc-big{min-height:260px}}
        @media(max-width:500px){.sc-small-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  )
}
