import { ACard } from '@/components/admin/AdminTable'

export default function Page() {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#E4E4E7' }}>Модел тохиргоо</h2>
      <ACard>
        <div style={{ padding: '20px 0', color: '#71717A', fontSize: 13, lineHeight: 2 }}>
          <p>AI модел тохиргоо нь preset бүр дээр хийгддэг.</p>
          <p>→ <a href="/admin/presets" style={{ color: '#C4B5FD' }}>Presets жагсаалт</a> → Preset сонгох → Модел таб</p>
          <p style={{ marginTop: 12, color: '#52525B' }}>Одоо дэмжигдэж буй провайдеруд: Gemini (imagen-4.0-fast-generate-001), OpenAI (gpt-image-1)</p>
        </div>
      </ACard>
    </div>
  )
}
