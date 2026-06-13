// Shared table primitives for admin pages

export function ACard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  )
}

export function APill({ children, color = 'purple' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, [string, string, string]> = {
    purple: ['rgba(124,58,237,.15)', 'rgba(124,58,237,.25)', '#C4B5FD'],
    blue: ['rgba(56,189,248,.12)', 'rgba(56,189,248,.2)', '#38BDF8'],
    pink: ['rgba(236,72,153,.12)', 'rgba(236,72,153,.2)', '#EC4899'],
    green: ['rgba(74,222,128,.12)', 'rgba(74,222,128,.2)', '#4ADE80'],
    amber: ['rgba(251,191,36,.12)', 'rgba(251,191,36,.2)', '#FBBF24'],
    red: ['rgba(239,68,68,.12)', 'rgba(239,68,68,.2)', '#EF4444'],
    gray: ['rgba(255,255,255,.07)', 'rgba(255,255,255,.1)', '#A1A1AA'],
  }
  const [bg, bdr, txt] = map[color] ?? map.gray
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: bg, border: `1px solid ${bdr}`, borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: txt, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function TH({
  children, col, align, sortCol, sortDir, onSort,
}: {
  children?: React.ReactNode
  col?: string
  align?: string
  sortCol?: string
  sortDir?: string
  onSort?: (col: string) => void
}) {
  const active = col && sortCol === col
  return (
    <th
      onClick={col && onSort ? () => onSort(col) : undefined}
      style={{ padding: '10px 12px', textAlign: (align as React.CSSProperties['textAlign']) ?? 'left', fontSize: 11, fontWeight: 700, color: active ? '#C4B5FD' : '#52525B', textTransform: 'uppercase', letterSpacing: '.8px', cursor: col ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap', transition: 'color .15s' }}
    >
      {children}
      {col && (
        <span style={{ marginLeft: 4, display: 'inline-flex', flexDirection: 'column', gap: 1, verticalAlign: 'middle', opacity: active ? 1 : 0.3 }}>
          <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir === 'asc' ? '#9D5FF5' : '#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
          <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir === 'desc' ? '#9D5FF5' : '#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
        </span>
      )}
    </th>
  )
}

export function TD({ children, style = {} }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '10px 12px', fontSize: 13, color: '#E4E4E7', ...style }}>{children}</td>
}
