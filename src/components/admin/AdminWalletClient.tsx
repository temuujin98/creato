'use client'

import { useState, useMemo } from 'react'
import { ACard, APill } from './AdminTable'

interface ProfileOption {
  id: string
  display_name: string | null
  email: string | null
}

interface WalletData {
  id: string
  balance: number
  updated_at: string
}

interface TxRow {
  id: string
  amount: number
  type: string
  status: string
  reason: string | null
  note: string | null
  created_at: string
}

const INP_S: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#E4E4E7',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const TYPE_LABELS: Record<string, string> = {
  refund: 'Буцаалт',
  compensation: 'Нөхөн олговор',
  manual_topup: 'Гараар нэмэх',
  bonus: 'Урамшуулал',
  correction: 'Засвар',
  failed_generation_reimbursement: 'Генерац амжилтгүй буцаалт',
  other: 'Бусад',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function AdminWalletClient({ profiles }: { profiles: ProfileOption[] }) {
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<ProfileOption | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<TxRow[]>([])
  const [loadingWallet, setLoadingWallet] = useState(false)

  const [txType, setTxType] = useState('manual_topup')
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return profiles.slice(0, 50)
    return profiles.filter(p =>
      (p.display_name ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    ).slice(0, 50)
  }, [profiles, query])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function selectUser(p: ProfileOption) {
    setSelectedUser(p)
    setDropdownOpen(false)
    setQuery(p.display_name ?? p.email ?? '')
    setLoadingWallet(true)
    setWallet(null)
    setTransactions([])
    try {
      const res = await fetch(`/api/admin/wallet/user/${p.id}`)
      const json = await res.json() as { wallet?: WalletData; transactions?: TxRow[]; error?: string }
      if (json.wallet) setWallet(json.wallet)
      if (json.transactions) setTransactions(json.transactions)
    } catch {
      // ignore
    } finally {
      setLoadingWallet(false)
    }
  }

  async function reloadWallet() {
    if (!selectedUser) return
    setLoadingWallet(true)
    try {
      const res = await fetch(`/api/admin/wallet/user/${selectedUser.id}`)
      const json = await res.json() as { wallet?: WalletData; transactions?: TxRow[]; error?: string }
      if (json.wallet) setWallet(json.wallet)
      if (json.transactions) setTransactions(json.transactions)
    } catch {
      // ignore
    } finally {
      setLoadingWallet(false)
    }
  }

  async function handleSubmit() {
    if (!selectedUser) return
    if (!reason.trim()) { showToast('Шалтгаан оруулна уу', false); return }
    if (!note.trim()) { showToast('Тэмдэглэл оруулна уу', false); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id, amount, type: txType, reason, note }),
      })
      const json = await res.json() as { ok?: boolean; error?: string; tx_id?: string }
      if (!res.ok || json.error) {
        showToast(json.error ?? 'Алдаа гарлаа', false)
      } else {
        showToast('Амжилттай бүртгэгдлээ', true)
        setReason('')
        setNote('')
        setAmount(0)
        await reloadWallet()
      }
    } catch {
      showToast('Сервертэй холбогдох алдаа', false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E4E4E7', marginBottom: 20 }}>
        Wallet тохиргоо
      </h2>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          background: toast.ok ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
          border: `1px solid ${toast.ok ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
          borderRadius: 8, padding: '10px 16px', color: toast.ok ? '#4ADE80' : '#EF4444',
          fontSize: 13, fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: user search */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <ACard style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 8 }}>
              Хэрэглэгч хайх
            </div>
            <div style={{ position: 'relative' }}>
              <input
                style={INP_S}
                value={query}
                onChange={e => { setQuery(e.target.value); setDropdownOpen(true) }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Нэр эсвэл имэйлээр хайх..."
              />
              {dropdownOpen && filtered.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto',
                }}>
                  {filtered.map(p => (
                    <div
                      key={p.id}
                      onClick={() => selectUser(p)}
                      style={{
                        padding: '9px 12px', cursor: 'pointer', fontSize: 13, color: '#E4E4E7',
                        borderBottom: '1px solid rgba(255,255,255,.04)',
                        transition: 'background .1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontWeight: 500 }}>{p.display_name ?? '(нэргүй)'}</div>
                      <div style={{ fontSize: 11, color: '#52525B', marginTop: 2 }}>{p.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div style={{ marginTop: 14, padding: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', marginBottom: 2 }}>
                  {selectedUser.display_name ?? '(нэргүй)'}
                </div>
                <div style={{ fontSize: 11, color: '#71717A', marginBottom: 10 }}>{selectedUser.email}</div>
                {loadingWallet ? (
                  <div style={{ fontSize: 12, color: '#52525B' }}>Уншиж байна...</div>
                ) : wallet ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#52525B', marginBottom: 2 }}>Үлдэгдэл</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#C4B5FD' }}>{wallet.balance} cr</div>
                    </div>
                    <button
                      onClick={reloadWallet}
                      style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, padding: '5px 10px', color: '#A1A1AA', fontSize: 12, cursor: 'pointer' }}
                    >
                      Татах
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#52525B' }}>Wallet олдсонгүй</div>
                )}
              </div>
            )}
          </ACard>
        </div>

        {/* Right: adjustment form */}
        {selectedUser && (
          <div style={{ flex: 2, minWidth: 300 }}>
            <ACard>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E4E4E7', marginBottom: 16 }}>
                Credit тохируулах
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Төрөл</div>
                <select
                  style={{ ...INP_S }}
                  value={txType}
                  onChange={e => setTxType(e.target.value)}
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: '#1A1A2E' }}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Дүн</div>
                <input
                  style={{ ...INP_S, width: 180 }}
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="0"
                />
                <div style={{ fontSize: 11, color: '#52525B', marginTop: 4 }}>Сөрөг = хасах (correction зорилгоор)</div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Шалтгаан *</div>
                <textarea
                  style={{ ...INP_S, resize: 'vertical', minHeight: 60 } as React.CSSProperties}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Зохицуулалтын шалтгаан..."
                  rows={2}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#52525B', marginBottom: 6 }}>Тэмдэглэл *</div>
                <textarea
                  style={{ ...INP_S, resize: 'vertical', minHeight: 72 } as React.CSSProperties}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Дэлгэрэнгүй тэмдэглэл..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ background: '#7C3AED', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Илгээж байна...' : 'Тохируулах'}
              </button>
            </ACard>
          </div>
        )}
      </div>

      {/* Transaction history */}
      {selectedUser && transactions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#E4E4E7', marginBottom: 12 }}>
            Сүүлийн гүйлгээнүүд
          </div>
          <ACard style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
                  <th style={TH_S}>№</th>
                  <th style={TH_S}>Огноо</th>
                  <th style={TH_S}>Төрөл</th>
                  <th style={{ ...TH_S, textAlign: 'right' }}>Дүн</th>
                  <th style={TH_S}>Статус</th>
                  <th style={TH_S}>Шалтгаан</th>
                  <th style={TH_S}>Тэмдэглэл</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={TD_S}><span style={{ color: '#52525B', fontSize: 12 }}>{i + 1}</span></td>
                    <td style={TD_S}><span style={{ fontSize: 12, color: '#71717A' }}>{formatDate(tx.created_at)}</span></td>
                    <td style={TD_S}>
                      <APill color="gray">{TYPE_LABELS[tx.type] ?? tx.type}</APill>
                    </td>
                    <td style={{ ...TD_S, textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: tx.amount >= 0 ? '#4ADE80' : '#EF4444' }}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                    <td style={TD_S}>
                      <APill color={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'amber' : 'red'}>
                        {tx.status}
                      </APill>
                    </td>
                    <td style={TD_S}><span style={{ fontSize: 12, color: '#A1A1AA' }}>{tx.reason ?? '—'}</span></td>
                    <td style={TD_S}><span style={{ fontSize: 12, color: '#71717A' }}>{tx.note ?? '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ACard>
        </div>
      )}

      {selectedUser && !loadingWallet && transactions.length === 0 && (
        <div style={{ marginTop: 24, padding: '24px', textAlign: 'center', color: '#52525B', fontSize: 13 }}>
          Гүйлгээний түүх байхгүй
        </div>
      )}
    </div>
  )
}

const TH_S: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#52525B',
  textTransform: 'uppercase',
  letterSpacing: '.8px',
  whiteSpace: 'nowrap',
}

const TD_S: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  color: '#E4E4E7',
}
