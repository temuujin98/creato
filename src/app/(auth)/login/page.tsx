'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function mapLoginError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Имэйл эсвэл нууц үг буруу'
  if (message.includes('Email not confirmed')) return 'Имэйлээ баталгаажуулна уу'
  return 'Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        toast.error(mapLoginError(authError.message))
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.')
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: '#05050A', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,.14) 0%,transparent 70%)', top: -200, right: -100 }} />
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', width: 400, height: 400, background: 'radial-gradient(circle,rgba(236,72,153,.08) 0%,transparent 70%)', bottom: -100, left: -100 }} />

      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Creato
          </Link>
          <Link href="/register" style={{ fontSize: 14, color: '#A1A1AA', textDecoration: 'none' }}>
            Бүртгэл байхгүй юу? <span style={{ color: '#9D5FF5', fontWeight: 500 }}>Бүртгүүлэх →</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', maxWidth: 420, background: 'rgba(13,13,20,.8)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>Нэвтрэх</h1>
            <p style={{ fontSize: 14, color: '#A1A1AA', marginBottom: 32, lineHeight: 1.5 }}>
              Creato-д тавтай морил. Prompt бичихгүйгээр AI зураг үүсгэ.
            </p>

            {/* Google */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button
                type="button"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 500, color: '#A1A1AA', cursor: 'pointer' }}
              >
                <GoogleIcon />
                Google-ээр нэвтрэх
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 24px', color: '#52525B', fontSize: 13 }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
              эсвэл
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 7 }}>Имэйл хаяг</label>
                <input
                  type="email"
                  placeholder="tanii@email.mn"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 16px', fontFamily: 'inherit', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA' }}>Нууц үг</label>
                  <a href="#" style={{ fontSize: 13, color: '#9D5FF5', textDecoration: 'none', fontWeight: 500 }}>Нууц үг мартсан?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Нууц үгээ оруулна уу"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 44px 12px 16px', fontFamily: 'inherit', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: 16, padding: 4, display: 'flex', alignItems: 'center' }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 0 20px rgba(124,58,237,.35)', marginTop: 8 }}
              >
                {loading ? 'Нэвтрэж байна...' : 'Нэвтрэх'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 14, color: '#A1A1AA', marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.08)' }}>
              Бүртгэл байхгүй юу? <Link href="/register" style={{ color: '#9D5FF5', textDecoration: 'none', fontWeight: 500 }}>Бүртгүүлэх</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
