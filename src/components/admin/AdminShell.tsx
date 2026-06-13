'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ── NAV ─────────────────────────────────────────────────── */
interface NavItem {
  id: string
  href: string
  label: string
  icon: React.ReactNode
  section: string | null
}

const NAV: NavItem[] = [
  {
    id: 'dash', href: '/admin', label: 'Хянах самбар', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'presets', href: '/admin/presets', label: 'Presets', section: 'Контент',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  },
  {
    id: 'preset-reviews', href: '/admin/preset-reviews', label: 'Preset хянах', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    id: 'categories', href: '/admin/categories', label: 'Ангилал', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  },
  {
    id: 'models', href: '/admin/models', label: 'Models', section: 'Тохиргоо',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    id: 'sizes', href: '/admin/sizes', label: 'Хэмжээ', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  },
  {
    id: 'quality', href: '/admin/quality', label: 'Чанар', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  },
  {
    id: 'users', href: '/admin/users', label: 'Хэрэглэгчид', section: 'Хэрэглэгч',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: 'wallet', href: '/admin/wallet', label: 'Wallet гүйлгээ', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  {
    id: 'packages', href: '/admin/packages', label: 'Credit багц', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    id: 'payments', href: '/admin/payments', label: 'Төлбөрүүд', section: 'Санхүү',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  },
  {
    id: 'company', href: '/admin/company', label: 'Байгууллагын хүсэлт', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>,
  },
  {
    id: 'generations', href: '/admin/generations', label: 'Генерацууд', section: 'Систем',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  },
  {
    id: 'ratings', href: '/admin/ratings', label: 'Үнэлгээ', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  },
  {
    id: 'homepage', href: '/admin/homepage', label: 'Homepage', section: 'CMS',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'settings', href: '/admin/settings', label: 'Тохиргоо', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    id: 'logs', href: '/admin/logs', label: 'Логууд', section: null,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>,
  },
  {
    id: 'reports', href: '/admin/reports', label: 'Санхүүгийн тайлан', section: 'Тайлан',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>,
  },
]

/* ── PAGE TITLE MAP ─────────────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Хянах самбар',
  '/admin/users': 'Хэрэглэгчид',
  '/admin/presets': 'Presets',
  '/admin/preset-reviews': 'Preset хянах',
  '/admin/generations': 'Генерацууд',
  '/admin/categories': 'Ангилал',
  '/admin/models': 'Models',
  '/admin/sizes': 'Хэмжээ',
  '/admin/quality': 'Чанар',
  '/admin/wallet': 'Wallet гүйлгээ',
  '/admin/packages': 'Credit багц',
  '/admin/payments': 'Төлбөрүүд',
  '/admin/company': 'Байгууллагын хүсэлт',
  '/admin/ratings': 'Үнэлгээ',
  '/admin/homepage': 'Homepage CMS',
  '/admin/settings': 'Тохиргоо',
  '/admin/logs': 'Логууд',
  '/admin/reports': 'Санхүүгийн тайлан',
}

/* ── SIDEBAR ─────────────────────────────────────────────── */
function AdminSidebar({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  let lastSection: string | null = null

  return (
    <aside style={{
      width: collapsed ? 56 : 220,
      minHeight: '100vh',
      background: '#08080F',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width .22s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        height: 52,
        borderBottom: '1px solid rgba(255,255,255,.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 16px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {collapsed
          ? <span style={{ fontSize: 16, fontWeight: 900, color: '#C4B5FD', letterSpacing: '-.5px' }}>C</span>
          : <span style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-.3px' }}>
              Creato <span style={{ fontSize: 10, fontWeight: 600, color: '#9D5FF5', background: 'rgba(124,58,237,.15)', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>ADMIN</span>
            </span>
        }
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        {NAV.map(item => {
          let sectionHeader: React.ReactNode = null
          if (item.section && item.section !== lastSection && !collapsed) {
            lastSection = item.section
            sectionHeader = (
              <div key={'s-' + item.section} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#3F3F46', padding: '14px 10px 6px', whiteSpace: 'nowrap' }}>
                {item.section}
              </div>
            )
          } else if (item.section) {
            lastSection = item.section
          }

          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          return (
            <div key={item.id}>
              {sectionHeader}
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px 0' : '7px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(124,58,237,.15)' : 'transparent',
                  color: isActive ? '#C4B5FD' : '#71717A',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all .12s',
                  marginBottom: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  boxShadow: isActive ? 'inset 1px 0 0 #7C3AED' : 'none',
                  textDecoration: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 18 }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize: 13 }}>{item.label}</span>}
              </Link>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

/* ── SHELL ───────────────────────────────────────────────── */
export default function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const sw = collapsed ? 56 : 220

  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05050A', color: '#fff', fontFamily: "'Roboto', sans-serif" }}>
      <AdminSidebar collapsed={collapsed} pathname={pathname} />

      <div style={{ flex: 1, marginLeft: sw, transition: 'margin-left .22s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: sw,
          right: 0,
          height: 52,
          background: 'rgba(5,5,10,.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          alignItems: 'center',
          paddingRight: 16,
          zIndex: 40,
          transition: 'left .22s cubic-bezier(.4,0,.2,1)',
          gap: 10,
        }}>
          {/* Sidebar toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              width: 52,
              height: 52,
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
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Page title */}
          <div style={{ flex: 1, paddingLeft: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E4E4E7' }}>{pageTitle}</div>
          </div>

          {/* User menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#71717A' }}>{userName}</span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.08)',
                color: '#A1A1AA',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Гарах
            </button>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'linear-gradient(135deg,#7C3AED,#EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 0 0 2px rgba(124,58,237,.3)',
              flexShrink: 0,
            }}>
              {userName[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, marginTop: 52, padding: '24px 20px', overflowY: 'auto', minHeight: 'calc(100vh - 52px)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
