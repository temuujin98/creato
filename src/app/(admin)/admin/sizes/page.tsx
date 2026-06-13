import { ACard } from '@/components/admin/AdminTable'

export default function Page() {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#E4E4E7' }}>Хэмжээ тохиргоо</h2>
      <ACard>
        <div style={{ padding: '20px 0', color: '#71717A', fontSize: 13, lineHeight: 2 }}>
          <p>Зургийн хэмжээний тохиргоо нь preset бүр дээр хийгддэг.</p>
          <p>→ <a href="/admin/presets" style={{ color: '#C4B5FD' }}>Presets жагсаалт</a> → Preset сонгох → Хэмжээ таб</p>
          <p style={{ marginTop: 12, color: '#52525B' }}>Ихэвчлэн хэрэглэгддэг хэмжээ: 1:1 (1024×1024), 16:9 (1536×864), 9:16 (864×1536), 4:3 (1152×864)</p>
        </div>
      </ACard>
    </div>
  )
}
