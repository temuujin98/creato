'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        transition: 'background .35s, backdrop-filter .35s, border-color .35s',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,.07)' : 'transparent'}`,
        background: scrolled ? 'rgba(7,6,15,.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 66 }}>
            <Link href="/" style={{ fontSize: 23, fontWeight: 900, letterSpacing: '-1.2px', color: '#F5F4FA', textDecoration: 'none' }}>
              Crea<em style={{ fontStyle: 'normal', color: '#C4B5FD' }}>to</em>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 44 }} className="hnav-desktop">
              {[['#presets', 'Presets'], ['#how', 'Яаж ажилладаг'], ['#showcase', 'Жишээ бүтээлүүд'], ['#help', 'Тусламж']].map(([href, label]) => (
                <a key={href} href={href} style={{ fontSize: 13.5, fontWeight: 500, color: '#8E8C9E', padding: '8px 14px', borderRadius: 9, transition: 'all .2s', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#F5F4FA'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,.05)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#8E8C9E'; (e.target as HTMLElement).style.background = 'transparent' }}>
                  {label}
                </a>
              ))}
            </nav>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/login" className="btn-desktop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#F5F4FA', textDecoration: 'none', transition: 'all .2s' }}>
                Нэвтрэх
              </Link>
              <Link href="/register" className="btn-desktop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 0 1px rgba(196,181,253,.25) inset,0 4px 24px rgba(124,58,237,.35)', transition: 'all .2s' }}>
                Эхлэх
              </Link>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="hmb-btn"
                aria-label="Цэс нээх"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 0, display: 'none', flexShrink: 0 }}>
                <span style={{ width: 16, height: 1.5, background: '#8E8C9E', borderRadius: 1, display: 'block', transition: 'all .24s', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
                <span style={{ width: 16, height: 1.5, background: '#8E8C9E', borderRadius: 1, display: 'block', transition: 'all .24s', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'none' }} />
                <span style={{ width: 16, height: 1.5, background: '#8E8C9E', borderRadius: 1, display: 'block', transition: 'all .24s', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div style={{
        position: 'fixed', top: 66, left: 0, right: 0, zIndex: 997,
        background: 'rgba(7,6,15,.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', padding: '0 28px 26px',
        opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
        pointerEvents: menuOpen ? 'all' : 'none',
        transition: 'opacity .28s, transform .28s',
      }} className="mob-nav-panel">
        {[['#presets', 'Presets'], ['#how', 'Яаж ажилладаг'], ['#showcase', 'Жишээ бүтээлүүд'], ['#help', 'Тусламж']].map(([href, label]) => (
          <a key={href} href={href} onClick={closeMenu} style={{ display: 'block', fontSize: 16, fontWeight: 500, color: '#8E8C9E', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,.07)', transition: 'color .2s', textDecoration: 'none' }}>
            {label}
          </a>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Link href="/login" onClick={closeMenu} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, fontWeight: 600, padding: '12px 26px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#F5F4FA', textDecoration: 'none' }}>
            Нэвтрэх
          </Link>
          <Link href="/register" onClick={closeMenu} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, fontWeight: 600, padding: '12px 26px', borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', textDecoration: 'none' }}>
            Эхлэх
          </Link>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .hnav-desktop{display:none!important}
          .btn-desktop{display:none!important}
          .hmb-btn{display:flex!important}
          .mob-nav-panel{display:block!important}
        }
      `}</style>
    </>
  )
}
