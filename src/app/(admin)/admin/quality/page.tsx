import { ACard } from '@/components/admin/AdminTable'

export default function Page() {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#E4E4E7' }}>Чанарын тохиргоо</h2>
      <ACard>
        <div style={{ padding: '20px 0', color: '#71717A', fontSize: 13, lineHeight: 2 }}>
          <p>Зургийн чанарын тохиргоо нь preset бүр дээр хийгддэг.</p>
          <p>→ <a href="/admin/presets" style={{ color: '#C4B5FD' }}>Presets жагсаалт</a> → Preset сонгох → Чанар таб</p>
          <p style={{ marginTop: 12, color: '#52525B' }}>Quality prompt-ийг preset editor дотор &quot;quality_prompt&quot; талбараар удирддаг. Хэрэглэгчид харагдахгүй.</p>
        </div>
      </ACard>
    </div>
  )
}
