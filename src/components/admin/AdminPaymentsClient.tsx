'use client'

import { useMemo, useState } from 'react'
import { ACard, APill, TH, TD } from './AdminTable'

interface PaymentRow {
  id: string
  user_id: string
  package_id: string | null
  amount_mnt: number
  provider: string
  status: string
  created_at: string
  paid_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'green',
  pending: 'amber',
  failed: 'red',
  cancelled: 'gray',
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Төлсөн',
  pending: 'Хүлээгдэж буй',
  failed: 'Амжилтгүй',
  cancelled: 'Цуцалсан',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('mn-MN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtMnt(amount: number) {
  return '₮' + amount.toLocaleString('mn-MN')
}

export default function AdminPaymentsClient({
  payments,
  userMap,
}: {
  payments: PaymentRow[]
  userMap: Record<string, string>
}) {
  const [sortCol, setSortCol] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('all')

  function onSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    let list = payments
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter)
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
  }, [payments, sortCol, sortDir, statusFilter])

  const sp = { sortCol, sortDir, onSort }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_mnt, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7', marginBottom: 2 }}>
            Төлбөрүүд{' '}
            <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({payments.length})</span>
          </h2>
          <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>
            Нийт төлсөн: <span style={{ color: '#4ADE80', fontWeight: 600 }}>{fmtMnt(totalPaid)}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'paid', 'pending', 'failed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '5px 10px', borderRadius: 100,
                border: `1px solid ${statusFilter === f ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.06)'}`,
                background: statusFilter === f ? 'rgba(124,58,237,.12)' : 'transparent',
                color: statusFilter === f ? '#C4B5FD' : '#71717A',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {f === 'all' ? 'Бүгд' : (STATUS_LABEL[f] ?? f)}
            </button>
          ))}
        </div>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH col="created_at" {...sp}>Огноо</TH>
              <TH col="user_id" {...sp}>Хэрэглэгч</TH>
              <TH col="amount_mnt" align="right" {...sp}>Дүн</TH>
              <TH col="provider" {...sp}>Provider</TH>
              <TH col="status" {...sp}>Статус</TH>
              <TH col="paid_at" {...sp}>Төлсөн огноо</TH>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>
                  Төлбөр олдсонгүй
                </td>
              </tr>
            ) : sorted.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .12s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                <TD style={{ color: '#71717A', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.created_at)}</TD>
                <TD style={{ fontSize: 12 }}>{userMap[p.user_id] ?? p.user_id.slice(0, 8)}</TD>
                <TD style={{ textAlign: 'right', fontWeight: 700, color: '#4ADE80' }}>{fmtMnt(p.amount_mnt)}</TD>
                <TD style={{ color: '#71717A', fontSize: 12 }}>{p.provider}</TD>
                <TD>
                  <APill color={STATUS_COLOR[p.status] ?? 'gray'}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </APill>
                </TD>
                <TD style={{ color: '#71717A', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.paid_at)}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </ACard>
    </div>
  )
}
