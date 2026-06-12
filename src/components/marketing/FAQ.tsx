'use client'

import { useState } from 'react'

export interface FAQProps {
  sectionKey?: string
  title?: string
  isVisible?: boolean
}

const ITEMS = [
  {
    q: 'Creato ашиглахад ямар мэдлэг хэрэгтэй вэ?',
    a: 'Ямар ч мэдлэг шаардлагагүй. Preset сонгоод, зургаа upload хийж, нэр, өнгө, хэмжээгээ сонгоод л болно. Prompt бичих, Photoshop мэдэх шаардлагагүй.',
  },
  {
    q: 'Credit гэж юу вэ? Хэрхэн ажилладаг вэ?',
    a: 'Нэг зураг үүсгэхэд 1 credit зарцуулдаг. Бүртгэл үүсгэхэд 1 туршилтын credit олгоно. Дараа нь credit авахдаа тариф сонгож худалдан авна.',
  },
  {
    q: 'Монгол бизнест тохирсон preset байгаа юу?',
    a: 'Тийм! Sale poster, хоолны зураг, product photo, beauty promo зэрэг Монгол бизнест хамгийн их хэрэглэгддэг загваруудыг онцгойлон бэлтгэсэн.',
  },
  {
    q: 'Үүсгэсэн зургийг яаж ашиглаж болох вэ?',
    a: 'Үүсгэсэн зургийг HD чанараар татаж аваад хаана ч ашиглаж болно — Instagram, Facebook, хэвлэмэл материал, онлайн дэлгүүр. Мөн My Images хэсэгт хадгалагддаг.',
  },
  {
    q: 'AI-ийн үүсгэсэн зураг хэр чанартай байдаг вэ?',
    a: 'Манай AI нь мэргэжлийн дизайн стандартад нийцсэн HD чанартай зураг үүсгэдэг. Дундаж хугацаа ~15 секунд. Зурагны чанарт сэтгэл ханамжгүй тохиолдолд дахин үүсгэж болно.',
  },
]

export default function FAQ({ title = 'Түгээмэл асуултууд', isVisible = true }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null)

  if (!isVisible) return null

  return (
    <section id="help" style={{ padding: '104px 0', background: '#0C0B1A' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Roboto Mono',monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: '#E879F9', marginBottom: 14 }}>
            <span style={{ color: '#8B5CF6', fontWeight: 700 }}>[</span>FAQ<span style={{ color: '#8B5CF6', fontWeight: 700 }}>]</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.05, color: '#F5F4FA' }}>{title}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ background: '#12101F', border: `1px solid ${isOpen ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', color: isOpen ? '#C4B5FD' : '#F5F4FA', textAlign: 'left', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, letterSpacing: '-.2px', transition: 'color .2s' }}>
                  <span>{item.q}</span>
                  <span style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${isOpen ? 'rgba(139,92,246,1)' : 'rgba(255,255,255,.07)'}`, background: isOpen ? 'rgba(139,92,246,.14)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .25s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div style={{ maxHeight: isOpen ? 320 : 0, overflow: 'hidden', transition: 'max-height .38s cubic-bezier(.4,0,.2,1)' }}>
                  <p style={{ fontSize: 14, color: '#8E8C9E', lineHeight: 1.8, padding: '0 22px 20px', margin: 0 }}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
