'use client'

import { useEffect, useRef } from 'react'

const PILLS = [
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><line x1="5" y1="5" x2="19" y2="19"/></svg>, bg: 'rgba(139,92,246,.14)', label: 'Prompt шаардлагагүй' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg: 'rgba(251,191,36,.12)', label: 'Монгол хэл дээр' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#E879F9" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/></svg>, bg: 'rgba(232,121,249,.12)', label: 'Social post' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="9" cy="11" r="1.6"/><path d="M20 15l-4-4-8 7"/></svg>, bg: 'rgba(56,189,248,.12)', label: 'Product photo' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, bg: 'rgba(74,222,128,.12)', label: 'Credit-ээр ашиглана' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5"><rect x="3" y="4" width="18" height="14" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/></svg>, bg: 'rgba(167,139,250,.12)', label: 'Бизнес visual' },
  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8"/></svg>, bg: 'rgba(244,114,182,.12)', label: 'My Images-д хадгална' },
]

export interface BenefitStripProps {
  isVisible?: boolean
}

export default function BenefitStrip({ isVisible = true }: BenefitStripProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // duplicate for seamless loop
    track.innerHTML += track.innerHTML
  }, [])

  if (!isVisible) return null

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', background: '#0C0B1A', padding: '18px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 120, background: 'linear-gradient(90deg,#0C0B1A,transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 120, background: 'linear-gradient(-90deg,#0C0B1A,transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div ref={trackRef} className="strip-track-anim" style={{ display: 'flex', gap: 12, width: 'max-content' }}>
        {PILLS.map((p, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "'Roboto Mono',monospace", fontSize: 12, fontWeight: 500, padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', whiteSpace: 'nowrap', color: '#8E8C9E' }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: p.bg }}>{p.icon}</span>
            {p.label}
          </span>
        ))}
      </div>
      <style>{`
        .strip-track-anim{animation:marquee 28s linear infinite}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        div:has(.strip-track-anim):hover .strip-track-anim{animation-play-state:paused}
        @media(prefers-reduced-motion:reduce){.strip-track-anim{animation:none}}
      `}</style>
    </div>
  )
}
