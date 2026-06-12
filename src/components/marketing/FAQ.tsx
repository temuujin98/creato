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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transition: 'transform .28s cubic-bezier(.34,1.3,.5,1)', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function FAQ({ title = 'Түгээмэл асуултууд', isVisible = true }: FAQProps) {
  const [open, setOpen] = useState<number | null>(0)
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ background: '#12101F', border: `1px solid ${isOpen ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .3s' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#F5F4FA', textAlign: 'left' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-.2px', lineHeight: 1.4 }}>{item.q}</span>
                  <span style={{ color: isOpen ? '#A78BFA' : '#4A4858', transition: 'color .28s' }}><Chevron open={isOpen} /></span>
                </button>
                <div style={{ maxHeight: isOpen ? 300 : 0, overflow: 'hidden', transition: 'max-height .35s cubic-bezier(.4,0,.2,1)' }}>
                  <p style={{ fontSize: 13.5, color: '#8E8C9E', lineHeight: 1.8, padding: '0 22px 22px', margin: 0 }}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
