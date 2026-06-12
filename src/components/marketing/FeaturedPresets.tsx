import Link from 'next/link'

export interface PresetPublicRow {
  id: string
  slug: string
  name: string
  short_description: string | null
  credit_cost: number
  category_name: string | null
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_new: boolean
}

export interface FeaturedPresetsProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
  presets: PresetPublicRow[]
}

// 8 placeholder motifs matching design-reference exactly
const MOTIFS = [
  { key: 'sale',    badge: 'Тренд',   badgeCls: 'pcb-hot', cat: 'Маркетинг', name: 'Sale постер',          use: 'Хямдрал, урамшууллын зарлал',  cr: 1 },
  { key: 'prod',    badge: 'Онцлох',  badgeCls: 'pcb-top', cat: 'Бүтээгдэхүүн', name: 'Product photo',     use: 'Онлайн дэлгүүрийн зураг',      cr: 1 },
  { key: 'food',    badge: null,       badgeCls: '',        cat: 'F&B',        name: 'Хоолны меню visual',  use: 'Ресторан, кафены меню',          cr: 2 },
  { key: 'beauty',  badge: 'Шинэ',    badgeCls: 'pcb-new', cat: 'Гоо сайхан', name: 'Beauty poster',       use: 'Салон, брэндийн постер',         cr: 1 },
  { key: 'ban',     badge: null,       badgeCls: '',        cat: 'Маркетинг',  name: 'Бизнес баннер',       use: 'Facebook, веб баннер',           cr: 1 },
  { key: 'prof',    badge: 'Онцлох',  badgeCls: 'pcb-top', cat: 'Портрет',   name: 'Профайл зураг',       use: 'LinkedIn, CV, соц профайл',      cr: 1 },
  { key: 'trav',    badge: null,       badgeCls: '',        cat: 'Аялал',      name: 'Travel package poster', use: 'Аяллын багцын зарлал',         cr: 2 },
  { key: 're',      badge: 'Шинэ',    badgeCls: 'pcb-new', cat: 'Үл хөдлөх', name: 'Real estate ad',      use: 'Орон сууцны зарын visual',       cr: 1 },
]

function Motif({ k }: { k: string }) {
  if (k === 'sale') return <div className="pc-th-motif m-sale" style={{ position: 'absolute', inset: 0 }}><div className="big" style={{ position: 'absolute', top: '18%', left: 12, right: 12, fontSize: 38, fontWeight: 900, letterSpacing: -1, color: '#fff', lineHeight: .92 }}>SALE<br />POST</div><div className="pct" style={{ position: 'absolute', bottom: '14%', left: 12, background: '#fff', color: '#2D0A4E', fontWeight: 900, fontSize: 17, padding: '5px 12px', borderRadius: 8 }}>-50%</div></div>
  if (k === 'prod') return <div className="pc-th-motif m-prod" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '10%', right: '14%', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.5),transparent 70%)' }} /><div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', width: '64%', height: 13, borderRadius: '50%', background: 'rgba(0,0,0,.4)', filter: 'blur(4px)' }} /><div style={{ position: 'absolute', bottom: '17%', left: '50%', transform: 'translateX(-50%)', width: '42%', height: '48%', borderRadius: 12, background: 'linear-gradient(160deg,#93C5FD,#3B82F6 65%,#1D4ED8)', boxShadow: '0 10px 28px rgba(0,0,0,.45)' }} /></div>
  if (k === 'food') return <div className="pc-th-motif m-food" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '12%', left: 14, fontSize: 15, fontWeight: 900, letterSpacing: 3, color: '#FDE68A' }}>МЕНЮ</div><div style={{ position: 'absolute', top: '34%', left: 14, height: 4, width: '46%', borderRadius: 2, background: 'rgba(255,255,255,.22)' }} /><div style={{ position: 'absolute', top: '44%', left: 14, height: 4, width: '38%', borderRadius: 2, background: 'rgba(255,255,255,.22)' }} /><div style={{ position: 'absolute', top: '54%', left: 14, height: 4, width: '42%', borderRadius: 2, background: 'rgba(255,255,255,.22)' }} /><div style={{ position: 'absolute', bottom: '-18%', right: '-12%', width: '62%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%,#FEF3C7,#F59E0B 55%,#B45309)', boxShadow: '0 -8px 30px rgba(0,0,0,.35)' }} /></div>
  if (k === 'beauty') return <div className="pc-th-motif m-beauty" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '16%', left: 14, fontSize: 26, fontWeight: 300, letterSpacing: 5, color: '#FBCFE8' }}>GLOW</div><div style={{ position: 'absolute', top: '38%', left: 14, fontSize: 9, letterSpacing: 3, color: 'rgba(251,207,232,.6)', textTransform: 'uppercase' }}>Beauty studio</div><div style={{ position: 'absolute', bottom: '-12%', right: '-8%', width: '55%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%,rgba(255,255,255,.55),rgba(244,114,182,.15) 65%)' }} /></div>
  if (k === 'ban') return <div className="pc-th-motif m-ban" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '22%', left: 12, right: '24%', height: '34%', borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)' }} /><div style={{ position: 'absolute', top: '30%', left: 24, fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-.3px' }}>Таны бизнес</div><div style={{ position: 'absolute', bottom: '18%', left: 12, background: '#CCFBF1', color: '#134E4A', fontSize: 10, fontWeight: 800, padding: '5px 12px', borderRadius: 100 }}>Дэлгэрэнгүй →</div></div>
  if (k === 'prof') return <div className="pc-th-motif m-prof" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', width: '34%', aspectRatio: '1', borderRadius: '50%', background: 'linear-gradient(160deg,#DDD6FE,#A78BFA)' }} /><div style={{ position: 'absolute', bottom: '-12%', left: '50%', transform: 'translateX(-50%)', width: '62%', height: '42%', borderRadius: '48% 48% 0 0', background: 'linear-gradient(160deg,#C4B5FD,#7C3AED)' }} /></div>
  if (k === 'trav') return <div className="pc-th-motif m-trav" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '14%', left: 14, fontSize: 13, fontWeight: 900, letterSpacing: 2, color: '#E0F2FE' }}>АЯЛАЛ</div><div style={{ position: 'absolute', top: '14%', right: '18%', width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle,#FEF9C3,#FDE047 70%)' }} /><div style={{ position: 'absolute', bottom: 0, right: '-4%', width: 0, height: 0, borderLeft: '90px solid transparent', borderRight: '90px solid transparent', borderBottom: '120px solid rgba(255,255,255,.09)' }} /><div style={{ position: 'absolute', bottom: 0, left: '-8%', width: 0, height: 0, borderLeft: '70px solid transparent', borderRight: '70px solid transparent', borderBottom: '90px solid rgba(255,255,255,.14)' }} /></div>
  if (k === 're') return <div className="pc-th-motif m-re" style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', top: '12%', left: 14, fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: '#DCFCE7' }}>ҮЛ ХӨДЛӨХ</div><div style={{ position: 'absolute', bottom: 0, left: '14%', width: '22%', height: '54%', background: 'rgba(255,255,255,.13)', borderRadius: '4px 4px 0 0' }} /><div style={{ position: 'absolute', bottom: 0, left: '40%', width: '26%', height: '72%', background: 'rgba(255,255,255,.2)', borderRadius: '4px 4px 0 0' }} /><div style={{ position: 'absolute', bottom: 0, left: '70%', width: '20%', height: '44%', background: 'rgba(255,255,255,.1)', borderRadius: '4px 4px 0 0' }} /></div>
  return null
}

const BADGE_STYLE: Record<string, React.CSSProperties> = {
  'pcb-hot': { background: 'rgba(232,121,249,.18)', border: '1px solid rgba(232,121,249,.35)', color: '#F0ABFC' },
  'pcb-new': { background: 'rgba(56,189,248,.16)', border: '1px solid rgba(56,189,248,.35)', color: '#7DD3FC' },
  'pcb-top': { background: 'rgba(251,191,36,.14)', border: '1px solid rgba(251,191,36,.3)', color: '#FCD34D' },
}

const MOTIF_BG: Record<string, string> = {
  sale:   'linear-gradient(150deg,#2D0A4E,#7C3AED 60%,#E879F9)',
  prod:   'linear-gradient(160deg,#0B1426,#15304F 55%,#2563EB)',
  food:   'linear-gradient(160deg,#1F1206,#92400E 60%,#F59E0B)',
  beauty: 'linear-gradient(160deg,#27060F,#9D174D 60%,#F472B6)',
  ban:    'linear-gradient(150deg,#031A1A,#0F766E 60%,#2DD4BF)',
  prof:   'linear-gradient(160deg,#150A2E,#4C1D95 60%,#A78BFA)',
  trav:   'linear-gradient(160deg,#03121F,#0C4A6E 55%,#38BDF8)',
  re:     'linear-gradient(160deg,#04190D,#166534 60%,#4ADE80)',
}

export default function FeaturedPresets({ title = 'Хамгийн их ашиглагддаг presets', isVisible = true, presets }: FeaturedPresetsProps) {
  if (!isVisible) return null

  // Merge live DB presets over placeholder motifs (by slug prefix matching)
  const cards = MOTIFS.map((m, i) => {
    const live = presets[i]
    return live ? { ...m, name: live.name, use: live.short_description ?? m.use, cr: live.credit_cost, slug: live.slug } : { ...m, slug: `/presets` }
  })

  return (
    <section id="presets" style={{ padding: '104px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 14 }}>
                <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Preset каталог<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
              </div>
              <h2 style={{ fontSize: 'clamp(30px,3.6vw,46px)', fontWeight: 900, letterSpacing: '-1.8px', lineHeight: 1.05, color: '#F5F4FA' }}>{title}</h2>
            </div>
            <Link href="/presets" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5, fontWeight: 600, padding: '12px 26px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#F5F4FA', textDecoration: 'none' }}>
              Бүгдийг үзэх <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>

        <div className="pgrid-layout">
          {cards.map((c, i) => (
            <Link key={i} href={`/presets`} className={`pc-card sr${i > 0 ? ` sr-d${Math.min(i, 7)}` : ''}`} style={{ background: '#12101F', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', textDecoration: 'none', display: 'block', position: 'relative' }}>
              <div style={{ aspectRatio: '4/3.4', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: MOTIF_BG[c.key] ?? '#12101F', transition: 'transform .45s cubic-bezier(.34,1.2,.5,1)' }} className="pc-th-inner">
                  <Motif k={c.key} />
                </div>
                {c.badge && (
                  <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, fontFamily: "'Roboto Mono',monospace", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, padding: '4px 9px', borderRadius: 5, backdropFilter: 'blur(8px)', ...BADGE_STYLE[c.badgeCls] }}>
                    {c.badge}
                  </span>
                )}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(180deg,transparent 40%,rgba(7,6,15,.85))', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 12, opacity: 0, transition: 'opacity .3s' }} className="pc-hover-overlay">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#12101F', fontSize: 11.5, fontWeight: 700, padding: '7px 14px', borderRadius: 8 }}>
                    Үүсгэх <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.8, color: '#4A4858', marginBottom: 5 }}>{c.cat}</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.2px', marginBottom: 4, lineHeight: 1.3, color: '#F5F4FA' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: '#8E8C9E', lineHeight: 1.5, marginBottom: 10 }}>{c.use}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Roboto Mono',monospace", fontSize: 10.5, fontWeight: 500, color: '#C4B5FD', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.18)', padding: '4px 10px', borderRadius: 6 }}>{c.cr} credit</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .pgrid-layout{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        @media(max-width:1024px){.pgrid-layout{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.pgrid-layout{grid-template-columns:1fr}}
        .pc-card:hover .pc-th-inner{transform:scale(1.04)}
        .pc-card:hover{transform:translateY(-6px);border-color:rgba(139,92,246,.25)!important;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 24px rgba(139,92,246,.08)}
        .pc-card{transition:transform .3s cubic-bezier(.34,1.3,.5,1),border-color .3s,box-shadow .3s}
        .pc-card:hover .pc-hover-overlay{opacity:1!important}
      `}</style>
    </section>
  )
}
