import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#07060F', borderTop: '1px solid rgba(255,255,255,.07)', padding: '64px 28px 36px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="footer-grid">
          {/* brand col */}
          <div>
            <Link href="/" style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-1.2px', color: '#F5F4FA', textDecoration: 'none', display: 'inline-block', marginBottom: 14 }}>
              Crea<em style={{ fontStyle: 'normal', color: '#C4B5FD' }}>to</em>
            </Link>
            <p style={{ fontSize: 13, color: '#8E8C9E', lineHeight: 1.75, maxWidth: 220, marginBottom: 20 }}>
              Монгол бизнест зориулсан prompt-free AI visual studio.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Facebook', href: '#', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                { label: 'Instagram', href: '#', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8C9E', transition: 'all .2s', textDecoration: 'none' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* nav cols */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#4A4858', marginBottom: 16, fontFamily: "'Roboto Mono',monospace" }}>Бүтээгдэхүүн</div>
            {[['#presets', 'Presets'], ['#how', 'Яаж ажилладаг'], ['#showcase', 'Жишээ бүтээлүүд'], ['/presets', 'Бүх preset']].map(([href, label]) => (
              <a key={href} href={href} style={{ display: 'block', fontSize: 13.5, color: '#8E8C9E', padding: '6px 0', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#F5F4FA'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E8C9E'}>
                {label}
              </a>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#4A4858', marginBottom: 16, fontFamily: "'Roboto Mono',monospace" }}>Компани</div>
            {[['#', 'Бидний тухай'], ['#', 'Блог'], ['#', 'Тусламж центр'], ['#help', 'FAQ']].map(([href, label]) => (
              <a key={label} href={href} style={{ display: 'block', fontSize: 13.5, color: '#8E8C9E', padding: '6px 0', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#F5F4FA'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E8C9E'}>
                {label}
              </a>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#4A4858', marginBottom: 16, fontFamily: "'Roboto Mono',monospace" }}>Бүртгэл</div>
            {[['/login', 'Нэвтрэх'], ['/register', 'Бүртгүүлэх'], ['#', 'Тариф']].map(([href, label]) => (
              <Link key={label} href={href} style={{ display: 'block', fontSize: 13.5, color: '#8E8C9E', padding: '6px 0', textDecoration: 'none', transition: 'color .2s' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', marginTop: 56, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#4A4858', margin: 0 }}>© {new Date().getFullYear()} Creato. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['#', 'Нууцлалын бодлого'], ['#', 'Үйлчилгээний нөхцөл']].map(([href, label]) => (
              <a key={label} href={href} style={{ fontSize: 12, color: '#4A4858', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#8E8C9E'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#4A4858'}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px}
        @media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:500px){.footer-grid{grid-template-columns:1fr}}
      `}</style>
    </footer>
  )
}
