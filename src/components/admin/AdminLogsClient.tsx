'use client'

import React, { useState } from 'react'
import { ACard, APill, TH, TD } from './AdminTable'

interface LogRow {
  id: string
  admin_id: string
  action: string
  target_table: string | null
  target_id: string | null
  payload: unknown
  created_at: string
}

function actionColor(action: string): string {
  if (action.includes('credit') || action.includes('adjust')) return 'amber'
  if (action.includes('delete') || action.includes('remove')) return 'red'
  if (action.includes('update') || action.includes('edit')) return 'blue'
  if (action.includes('create') || action.includes('add') || action.includes('insert')) return 'green'
  return 'gray'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('mn-MN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminLogsClient({
  logs,
  adminMap,
}: {
  logs: LogRow[]
  adminMap: Record<string, string>
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggle(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7' }}>
          Аудит лог{' '}
          <span style={{ fontSize: 13, color: '#52525B', fontWeight: 400 }}>({logs.length})</span>
        </h2>
      </div>

      <ACard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <TH>№</TH>
              <TH>Огноо</TH>
              <TH>Admin</TH>
              <TH>Үйлдэл</TH>
              <TH>Хүснэгт</TH>
              <TH>ID</TH>
              <TH>Payload</TH>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px 12px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>
                  Лог олдсонгүй
                </td>
              </tr>
            ) : logs.map((log, i) => (
              <React.Fragment key={log.id}>
                <tr
                  style={{ borderBottom: '1px solid rgba(255,255,255,.03)', cursor: 'pointer', transition: 'background .12s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  onClick={() => toggle(log.id)}
                >
                  <TD style={{ color: '#52525B', fontWeight: 600, width: 40 }}>{i + 1}</TD>
                  <TD style={{ color: '#71717A', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(log.created_at)}</TD>
                  <TD style={{ fontSize: 12 }}>{adminMap[log.admin_id] ?? log.admin_id.slice(0, 8)}</TD>
                  <TD><APill color={actionColor(log.action)}>{log.action}</APill></TD>
                  <TD style={{ color: '#71717A', fontSize: 12 }}>{log.target_table ?? '—'}</TD>
                  <TD style={{ color: '#52525B', fontSize: 11, fontFamily: 'monospace' }}>
                    {log.target_id ? log.target_id.slice(0, 12) + '…' : '—'}
                  </TD>
                  <TD>
                    <button
                      onClick={e => { e.stopPropagation(); toggle(log.id) }}
                      style={{
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.07)',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                        color: '#A1A1AA',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {expandedId === log.id ? 'Хаах' : 'Харах'}
                    </button>
                  </TD>
                </tr>
                {expandedId === log.id && (
                  <tr style={{ background: 'rgba(255,255,255,.015)' }}>
                    <td colSpan={7} style={{ padding: '12px 16px' }}>
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: '#A1A1AA',
                        background: 'rgba(0,0,0,.3)',
                        border: '1px solid rgba(255,255,255,.06)',
                        borderRadius: 6,
                        padding: 12,
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}>
                        {log.payload != null
                          ? JSON.stringify(log.payload, null, 2)
                          : 'null'}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </ACard>

      <div style={{ marginTop: 16, textAlign: 'center', color: '#52525B', fontSize: 12 }}>
        Хуучин логуудыг харах — одоогоор сүүлийн 100 бичлэг харагдаж байна
      </div>
    </div>
  )
}
