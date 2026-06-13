'use client'

import { useState, useMemo } from 'react'
import { ACard, APill, TH, TD } from './AdminTable'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  balance: number
  createdAt: string
}

export default function AdminUsersClient({ users }: { users: UserRow[] }) {
  const [sortCol, setSortCol] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [query, setQuery] = useState('')

  function onSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    let list = users
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortCol]
      const bv = (b as unknown as Record<string, unknown>)[sortCol]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return 0
    })
  }, [users, sortCol, sortDir, query])

  const sp = { sortCol, sortDir, onSort }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
          Хэрэглэгчид <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({users.length})</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, padding: '6px 10px', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Хэрэглэгч хайх..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: 180, fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH col="name" {...sp}>Нэр</TH>
              <TH col="email" {...sp}>Имэйл</TH>
              <TH col="role" {...sp}>Роль</TH>
              <TH col="balance" align="right" {...sp}>Credit</TH>
              <TH col="createdAt" {...sp}>Бүртгүүлсэн</TH>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>Хэрэглэгч олдсонгүй</td></tr>
            ) : sorted.map((u, i) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .12s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                <TD>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                      {(u.name !== '—' ? u.name : u.email)[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>{u.email}</TD>
                <TD>
                  <APill color={u.role === 'admin' ? 'purple' : 'gray'}>{u.role}</APill>
                </TD>
                <TD style={{ textAlign: 'right', fontWeight: 700, color: '#C4B5FD' }}>{u.balance}</TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </ACard>
    </div>
  )
}
