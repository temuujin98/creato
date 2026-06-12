'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getPwStrength(v: string): { width: string; color: string; label: string } {
  if (!v) return { width: '0', color: 'transparent', label: 'Нууц үг оруулна уу' }
  let str = 0
  if (v.length >= 8) str++
  if (/[A-Z]/.test(v)) str++
  if (/[0-9]/.test(v)) str++
  if (/[^a-zA-Z0-9]/.test(v)) str++
  if (str <= 1) return { width: '25%', color: '#EF4444', label: 'Сул нууц үг' }
  if (str === 2) return { width: '50%', color: '#F59E0B', label: 'Дундаж' }
  if (str === 3) return { width: '75%', color: '#10B981', label: 'Сайн' }
  return { width: '100%', color: '#6EE7B7', label: 'Маш найдвартай' }
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

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const pw = getPwStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agree) { setError('Үйлчилгээний нөхцөлийг зөвшөөрнө үү.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: '#05050A', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,.13) 0%,transparent 70%)', top: -150, left: -100 }} />
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', width: 400, height: 400, background: 'radial-gradient(circle,rgba(56,189,248,.07) 0%,transparent 70%)', bottom: -100, right: -100 }} />

      {/* Header */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Creato
        </Link>
        <Link href="/login" style={{ fontSize: 14, color: '#A1A1AA', textDecoration: 'none' }}>
          Бүртгэл байгаа уу? <span style={{ color: '#9D5FF5', fontWeight: 500 }}>Нэвтрэх →</span>
        </Link>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12px 24px 40px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'rgba(13,13,20,.85)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '36px 40px', backdropFilter: 'blur(20px)' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>Бүртгүүлэх</h1>
          <p style={{ fontSize: 14, color: '#A1A1AA', marginBottom: 28, lineHeight: 1.5 }}>
            Хурдан бүртгүүлж AI Studio-г туршаарай. Дэлгэрэнгүй мэдээллийг дараа бөглөж болно.
          </p>

          {/* Benefits */}
          <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.18)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9D5FF5', marginBottom: 10 }}>Бүртгүүлснээр авах зүйл</div>
            {['Prompt бичихгүйгээр AI зураг үүсгэх', 'Preset маркетплейст нэвтрэх', 'Wallet болон гүйлгээний түүхтэй', '1 туршилтын кредит үнэгүй'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A1A1AA', marginBottom: 7 }}>
                <span style={{ color: '#9D5FF5', fontWeight: 700, fontSize: 12 }}>✓</span> {b}
              </div>
            ))}
          </div>

          {/* Google */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 500, color: '#A1A1AA', cursor: 'pointer' }}>
              <GoogleIcon /> Google-ээр бүртгүүлэх
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 20px', color: '#52525B', fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            эсвэл
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
          </div>

          {error && (
            <div style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#9D5FF5', marginBottom: 20 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#10B981', marginBottom: 20 }}>
              Амжилттай бүртгүүллээ! Нэвтэрч байна...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 7 }}>Нэр</label>
              <input type="text" placeholder="Таны нэр" required value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 16px', fontFamily: 'inherit', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 7 }}>Имэйл хаяг</label>
              <input type="email" placeholder="tanii@email.mn" required value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 16px', fontFamily: 'inherit', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 7 }}>Нууц үг</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="8+ тэмдэгт" required value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 44px 12px 16px', fontFamily: 'inherit', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: 16, padding: 4 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ height: 3, borderRadius: 2, marginTop: 8, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, transition: 'width .3s,background .3s', width: pw.width, background: pw.color }} />
              </div>
              <div style={{ fontSize: 11, color: pw.color, marginTop: 5 }}>{pw.label}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="agree" checked={agree} onChange={e => setAgree(e.target.checked)} required
                style={{ appearance: 'none', WebkitAppearance: 'none', width: 18, height: 18, minWidth: 18, border: '2px solid rgba(255,255,255,.2)', borderRadius: 5, background: agree ? '#7C3AED' : 'transparent', flexShrink: 0, cursor: 'pointer', marginTop: 1 }} />
              <label htmlFor="agree" style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.5, cursor: 'pointer' }}>
                <a href="#" style={{ color: '#9D5FF5', textDecoration: 'none' }}>Үйлчилгээний нөхцөл</a> болон <a href="#" style={{ color: '#9D5FF5', textDecoration: 'none' }}>Нууцлалын бодлого</a>-г зөвшөөрч байна
              </label>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 20px rgba(124,58,237,.35)' }}>
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 14, color: '#A1A1AA', marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.08)' }}>
            Аль хэдийн бүртгэлтэй юу? <Link href="/login" style={{ color: '#9D5FF5', textDecoration: 'none', fontWeight: 500 }}>Нэвтрэх</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
