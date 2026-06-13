import { ACard } from './AdminTable'

export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
      <ACard>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3F3F46' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔧</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#52525B', marginBottom: 6 }}>Тун удахгүй</div>
          <div style={{ fontSize: 13 }}>Энэ модуль Phase 5-д нэмэгдэнэ.</div>
        </div>
      </ACard>
    </div>
  )
}
