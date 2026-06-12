export interface UseCasesProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const CASES = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, title: 'E-commerce', desc: 'Бүтээгдэхүүний зураг, sale poster, banner рекламыг хурдан хийж онлайн дэлгүүрээ идэвхжүүл.', accent: '#8B5CF6', tags: ['Product photo', 'Sale poster'] },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E879F9" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, title: 'Контент бүтээгч', desc: 'Instagram, Facebook, TikTok-д зориулсан мэргэжлийн visual контентийг минутанд бэлтгэ.', accent: '#E879F9', tags: ['Social post', 'Story'] },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Ресторан, кафе', desc: 'Хоол, унд, промо visual-ыг Монгол хэл, монгол загвараар хялбар үүсгэ.', accent: '#FBBF24', tags: ['Меню', 'Food photo'] },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F9A8D4" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, title: 'Гоо сайхан', desc: 'Арьс, үс, хумс, гоо сайхны бүтээгдэхүүнд тохирсон хөнгөн, гоёмсог visual.', accent: '#F9A8D4', tags: ['Beauty promo', 'Product'] },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: 'Маркетинг', desc: 'Кампанит ажил, реклам, брэнд материалыг хурдан бэлтгэж ажлаа цаг хугацаанд нь хүлээлгэ.', accent: '#A3E635', tags: ['Banner', 'Campaign'] },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, title: 'Аялал, зочид буудал', desc: 'Аялалын пакет, зочид буудлын промо, оффер-ын гэрэл зургийг AI-р үүсгэ.', accent: '#F59E0B', tags: ['Travel photo', 'Promo'] },
]

export default function UseCases({ title = 'Хэн ашиглах вэ?', isVisible = true }: UseCasesProps) {
  if (!isVisible) return null
  return (
    <section style={{ padding: '104px 0', background: '#07060F', position: 'relative' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 14 }}>
            <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>Хэрэглэгч<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px,3.2vw,42px)', fontWeight: 900, letterSpacing: '-1.6px', lineHeight: 1.05, color: '#F5F4FA' }}>{title}</h2>
        </div>

        <div className="uc-grid">
          {CASES.map((c, i) => (
            <div key={i} className="uc-card" style={{ background: '#12101F', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '26px 22px', position: 'relative', overflow: 'hidden', transition: 'transform .3s cubic-bezier(.34,1.3,.5,1),border-color .3s' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 0% 0%,${c.accent}08 0%,transparent 55%)`, pointerEvents: 'none' }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.accent}15`, border: `1px solid ${c.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {c.icon}
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '-.4px', color: '#F5F4FA', marginBottom: 10 }}>{c.title}</div>
              <p style={{ fontSize: 12.5, color: '#8E8C9E', lineHeight: 1.75, marginBottom: 16 }}>{c.desc}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.tags.map(t => (
                  <span key={t} style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, fontWeight: 500, color: c.accent, background: `${c.accent}12`, border: `1px solid ${c.accent}28`, borderRadius: 6, padding: '3px 9px' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .uc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .uc-card:hover{transform:translateY(-5px);border-color:rgba(139,92,246,.25)!important}
        @media(max-width:900px){.uc-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.uc-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  )
}
