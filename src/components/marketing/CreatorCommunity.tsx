export interface CreatorCommunityProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const CARDS = [
  { name: 'Болд.Д', role: 'E-commerce бизнес', text: 'Өмнө нь дизайнерт 1 зургаа 50к+ төлдөг байсан. Одоо 1 credit-ээр өөрөө хийдэг болсон.', c: '#8B5CF6', emoji: '🛍️' },
  { name: 'Номин.Г', role: 'Инстаграм контент', text: 'Mongolian AI tool болохоор монгол текст, монгол маяг автоматаар ойлгодог. Маш хялбар.', c: '#E879F9', emoji: '📱' },
  { name: 'Бямба.О', role: 'Хоолны газар', text: 'Меню зураг, promotion poster бүгдийг Creato-р хийдэг. Хэрэглэхэд маш энгийн.', c: '#38BDF8', emoji: '🍜' },
  { name: 'Сарнай.Б', role: 'Beauty салон', text: 'Ажлын чанар гайхалтай. Мэргэжлийн дизайнеры хийсэн мэт харагддаг.', c: '#F9A8D4', emoji: '💅' },
  { name: 'Ганчимэг.Т', role: 'Онлайн дэлгүүр', text: 'Product photo-г маш хурдан хийдэг. Байнгын хэрэглэгч болчихлоо.', c: '#4ADE80', emoji: '📦' },
  { name: 'Тэмүүжин.С', role: 'Маркетинг менежер', text: 'Баг маань Creato-г campaign дээрээ ашиглаж байгаа. Delivery хурдтай, чанар өндөр.', c: '#FBBF24', emoji: '📊' },
]

export default function CreatorCommunity({ title = 'Манай бүтээлчидтэй нэгдэ', isVisible = true }: CreatorCommunityProps) {
  if (!isVisible) return null
  return (
    <section style={{ padding: '104px 0', background: '#0C0B1A', position: 'relative', overflow: 'hidden' }}>
      {/* decorative glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(139,92,246,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 14 }}>
            <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Нийгэмлэг<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px,3.2vw,42px)', fontWeight: 900, letterSpacing: '-1.6px', lineHeight: 1.05, color: '#F5F4FA' }}>{title}</h2>
          <p style={{ fontSize: 15, color: '#8E8C9E', marginTop: 14, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            Монгол бизнес эрхлэгчид, контент бүтээгчид, маркетерууд Creato-г ашиглаж байна
          </p>
        </div>

        <div className="comm-grid">
          {CARDS.map((c, i) => (
            <div key={i} className="comm-card" style={{
              background: '#12101F', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16,
              padding: '24px 22px', transition: 'transform .3s cubic-bezier(.34,1.3,.5,1),border-color .3s',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 16px 0 0', background: `radial-gradient(circle at top right,${c.c}15 0%,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 26, marginBottom: 14 }}>{c.emoji}</div>
              <p style={{ fontSize: 13, color: '#C4B5FD', lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic' }}>"{c.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${c.c}44,${c.c}22)`, border: `1px solid ${c.c}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.c, flexShrink: 0 }}>
                  {c.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F4FA' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#8E8C9E' }}>{c.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* stat bar */}
        <div className="stat-bar">
          {[['500+', 'Идэвхтэй хэрэглэгч'], ['2,400+', 'Зураг үүсгэсэн'], ['98%', 'Сэтгэл ханамж']].map(([n, l], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#F5F4FA', background: 'linear-gradient(135deg,#C4B5FD,#E879F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
              <div style={{ fontSize: 12, color: '#8E8C9E', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .comm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:52px}
        .comm-card:hover{transform:translateY(-5px);border-color:rgba(139,92,246,.25)!important}
        .stat-bar{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:32px 40px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.15);border-radius:16px}
        @media(max-width:900px){.comm-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.comm-grid{grid-template-columns:1fr}.stat-bar{grid-template-columns:1fr;gap:16px;padding:24px 20px}}
      `}</style>
    </section>
  )
}
