'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Хяналтын самбар',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'presets',
    label: 'Presets',
    href: '/presets',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
    ),
  },
  {
    id: 'my-images',
    label: 'Миний зургууд',
    href: '/my-images',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  {
    id: 'my-presets',
    label: 'Миний presets',
    href: '/my-presets',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9"/>
        <path d="M16 3h5v5"/>
        <path d="M21 3l-7 7"/>
      </svg>
    ),
  },
  {
    id: 'credits',
    label: 'Credit авах',
    href: '/credits',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Төлбөрийн түүх',
    href: '/billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Гүйлгээ',
    href: '/transactions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Тохиргоо',
    href: '/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Тусламж',
    href: '/help',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Хяналтын самбар',
  '/presets': 'Presets',
  '/my-images': 'Миний зургууд',
  '/my-presets': 'Миний presets',
  '/credits': 'Credit авах',
  '/billing': 'Төлбөрийн түүх',
  '/transactions': 'Гүйлгээ',
  '/settings': 'Тохиргоо',
  '/help': 'Тусламж',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Handle dynamic routes like /presets/[slug]
  if (pathname.endsWith('/generate')) return 'Зураг үүсгэх'
  if (pathname.startsWith('/presets/')) return 'Preset дэлгэрэнгүй'
  return 'Creato'
}

interface ClientShellProps {
  balance: number
  userEmail: string
  children: React.ReactNode
}

export default function ClientShell({ balance, userEmail, children }: ClientShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const sidebarWidth = collapsed ? 64 : 232

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05050A', color: '#fff', fontFamily: "'Roboto', sans-serif" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 49 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        minHeight: '100vh',
        background: '#08080F',
        borderRight: '1px solid rgba(255,255,255,.07)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          height: 60,
          borderBottom: '1px solid rgba(255,255,255,.06)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          overflow: 'hidden',
        }}>
          {collapsed
            ? <span style={{ fontSize: 17, fontWeight: 900, color: '#C4B5FD', letterSpacing: '-.5px' }}>C</span>
            : <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>Creato</span>
          }
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'hidden' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 16px' : '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: active ? 'rgba(124,58,237,.15)' : 'transparent',
                  color: active ? '#C4B5FD' : '#A1A1AA',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  transition: 'all .15s',
                  marginBottom: 2,
                  boxShadow: active ? 'inset 2px 0 0 #7C3AED' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 16 }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Wallet card (expanded only) */}
        {!collapsed && (
          <div style={{ padding: '10px 10px 0' }}>
            <div style={{
              background: 'linear-gradient(135deg,rgba(124,58,237,.14) 0%,rgba(109,40,217,.08) 100%)',
              borderRadius: 12,
              padding: '12px 14px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1.5px', color: '#E9D5FF', lineHeight: 1 }}>{balance}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#9D5FF5' }}>credit</span>
              </div>
              <Link
                href="/credits"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  width: '100%',
                  background: 'rgba(124,58,237,.18)',
                  border: '1px solid rgba(124,58,237,.3)',
                  borderRadius: 8,
                  padding: '7px',
                  color: '#C4B5FD',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Credit нэмэх
              </Link>
            </div>
          </div>
        )}

        {/* User / logout */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.06)',
          padding: collapsed ? '10px 8px' : '10px',
          marginTop: 8,
          flexShrink: 0,
        }}>
          {collapsed ? (
            <button
              onClick={handleSignOut}
              title="Гарах"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                color: '#52525B',
                cursor: 'pointer',
                transition: 'color .15s',
              }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#EF4444'}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#52525B'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7C3AED,#38BDF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {userEmail[0]?.toUpperCase() ?? 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Гарах"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#52525B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'color .15s',
                  flexShrink: 0,
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#EF4444'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#52525B'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          height: 60,
          background: 'rgba(5,5,10,.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          alignItems: 'center',
          paddingRight: 24,
          zIndex: 40,
          transition: 'left .25s cubic-bezier(.4,0,.2,1)',
          gap: 14,
        }}>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              width: 60,
              height: 60,
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              color: '#52525B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color .15s',
            }}
            aria-label="Sidebar-г нугалах"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {getPageTitle(pathname)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, marginTop: 60, padding: '32px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
