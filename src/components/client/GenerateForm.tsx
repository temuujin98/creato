'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { PresetPublic, PresetFieldPublic } from '@/types/preset'
import ImageUpload from './ImageUpload'

const GRAD_THUMBS = [
  'linear-gradient(160deg,#1A0A2E,#3D1B69,#7C3AED)',
  'linear-gradient(135deg,#0C1A2E,#164E63,#0EA5E9,#38BDF8)',
  'linear-gradient(135deg,#1A0515,#7C1D4E,#EC4899)',
  'linear-gradient(135deg,#0A1A0A,#14532D,#16A34A,#4ADE80)',
]

interface GenerateFormProps {
  preset: PresetPublic
  fields: PresetFieldPublic[]
  walletBalance: number
  userId: string
}

type GenState = 'idle' | 'loading' | 'done' | 'error'

interface GenResult {
  id: string
  status: string
  outputSignedUrls: string[]
  creditCost: number
}

export default function GenerateForm({ preset, fields, walletBalance, userId }: GenerateFormProps) {
  const router = useRouter()
  // Optimistic local balance — updated immediately on success, router.refresh() syncs server
  const [localBalance, setLocalBalance] = useState(walletBalance)
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([])
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of fields) init[f.field_key] = ''
    return init
  })
  const [selectedSize, setSelectedSize] = useState<string>(preset.allowed_sizes[0] ?? '1:1')
  const [state, setState] = useState<GenState>('idle')
  const stateRef = useRef<GenState>('idle')
  const [result, setResult] = useState<GenResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const creditCost = preset.credit_cost
  const canAfford = localBalance >= creditCost
  const imageReady = !preset.requires_image || uploadedPaths.length >= preset.min_image_count

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/generate/${id}`)
      if (!res.ok) return
      const data: GenResult = await res.json()
      if (data.status === 'completed') {
        stopPolling()
        stateRef.current = 'done'
        setResult(data)
        setState('done')
        // Optimistic balance update + refresh server components (sidebar wallet card)
        setLocalBalance(prev => Math.max(0, prev - (data.creditCost ?? creditCost)))
        router.refresh()
      } else if (data.status === 'failed') {
        stopPolling()
        stateRef.current = 'error'
        setErrorMsg('Техникийн алдааны улмаас үүсгэж чадсангүй. Credit буцаагдлаа.')
        setState('error')
      }
    } catch {
      // continue polling
    }
  }, [stopPolling])

  async function handleGenerate() {
    if (state === 'loading') return

    // Validate required fields
    for (const f of fields) {
      if (f.required && !inputs[f.field_key]?.trim()) {
        setErrorMsg(`"${f.label}" талбарыг бөглөнө үү.`)
        return
      }
    }

    // Validate image upload requirement
    if (preset.requires_image && uploadedPaths.length < preset.min_image_count) {
      setErrorMsg(`Дор хаяж ${preset.min_image_count} зураг оруулна уу.`)
      return
    }

    setState('loading')
    stateRef.current = 'loading'
    setErrorMsg('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetSlug: preset.slug,
          userInputs: inputs,
          selectedSize,
          inputImagePaths: preset.requires_image ? uploadedPaths : [],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Алдаа гарлаа')
        setState('error')
        return
      }

      // If immediately completed (sync response)
      if (data.status === 'completed') {
        stateRef.current = 'done'
        setResult(data)
        setState('done')
        setLocalBalance(prev => Math.max(0, prev - (data.creditCost ?? creditCost)))
        router.refresh()
        return
      }

      // Poll for async completion
      const genId: string = data.id
      pollRef.current = setInterval(() => pollStatus(genId), 2000)

      // Timeout after 90s
      setTimeout(() => {
        stopPolling()
        if (stateRef.current === 'loading') {
          setErrorMsg('Хүсэлт хэтэрхий удлаа. Дахин оролдоно уу.')
          stateRef.current = 'error'
          setState('error')
        }
      }, 90000)
    } catch {
      setErrorMsg('Сүлжээний алдаа гарлаа. Дахин оролдоно уу.')
      setState('error')
    }
  }

  function handleRetry() {
    stopPolling()
    stateRef.current = 'idle'
    setState('idle')
    setErrorMsg('')
    setResult(null)
  }

  function getSizeDimensions(size: string): string {
    const map: Record<string, string> = {
      '1:1': '1024×1024',
      '16:9': '1920×1080',
      '9:16': '1080×1920',
      '4:5': '1080×1350',
      '4:3': '1024×768',
      '3:4': '768×1024',
    }
    return map[size] ?? size
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link
          href={`/presets/${preset.slug}`}
          style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.08)',
            color: '#A1A1AA',
            borderRadius: 8,
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          ← Буцах
        </Link>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.5px', margin: 0 }}>{preset.name}</h2>
          {preset.category_name && (
            <div style={{ fontSize: 13, color: '#52525B' }}>{preset.category_name}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT: Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Image upload — shown only for requires_image presets */}
          {preset.requires_image && (
            <ImageUpload
              userId={userId}
              minCount={preset.min_image_count}
              maxCount={preset.max_image_count}
              allowedTypes={preset.allowed_file_types ?? ['jpg', 'jpeg', 'png', 'webp']}
              maxFileSizeMb={preset.max_file_size_mb ?? 10}
              guideText={preset.upload_guide_text}
              onChange={setUploadedPaths}
            />
          )}

          {/* Dynamic fields */}
          {fields.length > 0 && (
            <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Мэдээллээ оруулна уу</div>
              {fields.map((f) => (
                <div key={f.field_key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#E4E4E7' }}>
                    {f.label}
                    {f.required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
                  </label>
                  {f.input_type === 'textarea' ? (
                    <textarea
                      value={inputs[f.field_key] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [f.field_key]: e.target.value }))}
                      placeholder={f.placeholder ?? ''}
                      rows={3}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : f.input_type === 'color' ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['#7C3AED', '#EC4899', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#1D4ED8'].map(c => (
                        <div
                          key={c}
                          onClick={() => setInputs(prev => ({ ...prev, [f.field_key]: c }))}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: c,
                            cursor: 'pointer',
                            border: `2px solid ${inputs[f.field_key] === c ? '#fff' : 'transparent'}`,
                            boxShadow: inputs[f.field_key] === c ? `0 0 12px ${c}80` : 'none',
                            transition: 'all .15s',
                          }}
                        />
                      ))}
                    </div>
                  ) : f.input_type === 'select' && f.choices ? (
                    <select
                      value={inputs[f.field_key] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [f.field_key]: e.target.value }))}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Сонгох...</option>
                      {(Array.isArray(f.choices) ? f.choices : []).map((ch: string) => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.input_type === 'number' ? 'number' : 'text'}
                      value={inputs[f.field_key] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [f.field_key]: e.target.value }))}
                      placeholder={f.placeholder ?? ''}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  {f.help_text && (
                    <div style={{ fontSize: 11, color: '#52525B', marginTop: 4 }}>{f.help_text}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Size selector */}
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Хэмжээ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {preset.allowed_sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: `1px solid ${selectedSize === s ? 'rgba(124,58,237,.5)' : 'rgba(255,255,255,.08)'}`,
                    background: selectedSize === s ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.03)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all .15s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedSize === s ? '#C4B5FD' : '#fff' }}>{s}</div>
                  <div style={{ fontSize: 11, color: '#52525B' }}>{getSizeDimensions(s)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Credit + Generate */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(124,58,237,.1),rgba(17,17,28,1))',
            border: '1px solid rgba(124,58,237,.2)',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9D5FF5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              Credit зарцуулалт
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid rgba(124,58,237,.1)', color: '#A1A1AA', marginBottom: 4 }}>
              <span>Генерац</span>
              <span style={{ fontWeight: 600, color: '#C4B5FD' }}>{creditCost} cr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, margin: '10px 0 6px' }}>
              <span>Нийт</span>
              <span style={{ color: '#9D5FF5' }}>{creditCost} cr</span>
            </div>
            <div style={{ fontSize: 12, color: canAfford ? '#52525B' : '#EF4444', marginBottom: 16 }}>
              Үлдэгдэл: {localBalance} credit{!canAfford && ' — хүрэлцэхгүй'}
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#EF4444',
                marginBottom: 12,
              }}>
                {errorMsg}
              </div>
            )}

            {!canAfford ? (
              <Link
                href="/credits"
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'rgba(239,68,68,.15)',
                  border: '1px solid rgba(239,68,68,.3)',
                  color: '#F87171',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Credit нэмэх →
              </Link>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={state === 'loading' || !imageReady}
                style={{
                  width: '100%',
                  background: (state === 'loading' || !imageReady) ? 'rgba(124,58,237,.3)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: (state === 'loading' || !imageReady) ? 'not-allowed' : 'pointer',
                  boxShadow: state === 'loading' ? 'none' : '0 0 20px rgba(124,58,237,.35)',
                  fontFamily: 'inherit',
                  transition: 'all .2s',
                }}
              >
                {state === 'loading' ? 'Үүсгэж байна...' : 'Үүсгэх'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Result panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            background: '#12121C',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 16,
            minHeight: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: state === 'done' ? 0 : 40,
          }}>
            {state === 'idle' && (
              <div style={{ textAlign: 'center', color: '#3F3F46' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>◻</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#52525B' }}>Үр дүн энд гарна</div>
                <div style={{ fontSize: 13 }}>Тохиргоо хийж үүсгэх товч дарна уу</div>
              </div>
            )}

            {state === 'loading' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '3px solid rgba(124,58,237,.2)',
                  borderTop: '3px solid #7C3AED',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px',
                }} />
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>AI боловсруулж байна...</div>
                <div style={{ fontSize: 13, color: '#52525B' }}>Дунджаар 15–30 секунд</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {state === 'done' && result && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, padding: 20 }}>
                {result.outputSignedUrls.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: result.outputSignedUrls.length > 1 ? 'repeat(2,1fr)' : '1fr', gap: 10, marginBottom: 14 }}>
                    {result.outputSignedUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt={`Гаралт ${i + 1}`}
                        style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', display: 'block' }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 340, background: GRAD_THUMBS[0], borderRadius: 10, marginBottom: 14, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <span style={{
                        background: 'rgba(74,222,128,.15)',
                        border: '1px solid rgba(74,222,128,.3)',
                        borderRadius: 100,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#4ADE80',
                      }}>
                        ✓ Амжилттай
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {result.outputSignedUrls[0] && (
                    <a
                      href={result.outputSignedUrls[0]}
                      download
                      style={{
                        flex: 1,
                        minWidth: 120,
                        background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      ↓ Татаж авах
                    </a>
                  )}
                  <button
                    onClick={handleRetry}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      background: 'rgba(255,255,255,.06)',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff',
                      borderRadius: 8,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    ↺ Дахин үүсгэх
                  </button>
                  <Link
                    href="/my-images"
                    style={{
                      flex: 1,
                      minWidth: 120,
                      background: 'rgba(255,255,255,.06)',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff',
                      borderRadius: 8,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Миний зургууд
                  </Link>
                </div>

                <div style={{
                  marginTop: 14,
                  background: 'rgba(74,222,128,.08)',
                  border: '1px solid rgba(74,222,128,.2)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#4ADE80',
                }}>
                  ✓ {result.creditCost} credit зарцуулагдлаа · Үлдэгдэл: {localBalance} credit
                </div>
              </div>
            )}

            {state === 'error' && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 12, color: '#EF4444' }}>✕</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#EF4444' }}>Алдаа гарлаа</div>
                <div style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 16 }}>
                  {errorMsg || 'Техникийн алдааны улмаас үүсгэж чадсангүй'}
                </div>
                <div style={{
                  background: 'rgba(74,222,128,.08)',
                  border: '1px solid rgba(74,222,128,.2)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#4ADE80',
                  marginBottom: 16,
                }}>
                  ✓ Credit буцаагдлаа
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  ↺ Дахин оролдох
                </button>
              </div>
            )}
          </div>

          {/* Example outputs */}
          <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#52525B', marginBottom: 10 }}>Жишээ гаралтууд</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    background: preset.example_image_urls?.[i]
                      ? `url(${preset.example_image_urls[i]}) center/cover`
                      : GRAD_THUMBS[i % GRAD_THUMBS.length],
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,.07)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
