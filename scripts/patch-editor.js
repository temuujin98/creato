const fs = require('fs');
let src = fs.readFileSync('src/components/admin/PresetEditorClient.tsx', 'utf8');

// ── 1. Model tab: add Hints after provider chip rows ──

// Primary provider hint
src = src.replace(
  '            </Row>\n            <Row>\n              <Field>\n                <FL>Primary Model</FL>',
  '            </Row>\n            <Hint>Үндсэн AI үйлчилгээ. Gemini хямд, OpenAI чанар сайн. Эхэлж үүгээр оролдоно.</Hint>\n            <Row>\n              <Field>\n                <FL>Primary Model</FL>'
);

// Fallback provider hint
src = src.replace(
  '            </Row>\n            <Row>\n              <Field>\n                <FL>Fallback Model</FL>',
  '            </Row>\n            <Hint>Үндсэн амжилтгүй бол энэ рүү шилжинэ. Хэрэглэгч асуудлыг мэдрэхгүй.</Hint>\n            <Row>\n              <Field>\n                <FL>Fallback Model</FL>'
);

// Quality Preset hint (after chips, before Retry Limit row)
src = src.replace(
  '              </Field>\n            </Row>\n            <Row>\n              <Field>\n                <FL>Retry Limit</FL>',
  '              <Hint>Standard — хурдан, хямд. High — тэнцвэртэй. Premium — хамгийн сайн чанар, илүү credit зарцуулна.</Hint>\n              </Field>\n            </Row>\n            <Row>\n              <Field>\n                <FL>Retry Limit</FL>'
);

// Retry Limit: add onWheel + Hint
src = src.replace(
  '<input style={INP_S} type="number" min={0} max={5} value={draft.retry_limit} onChange={e => set(\'retry_limit\', Number(e.target.value))} />',
  '<input style={INP_S} type="number" min={0} max={5} value={draft.retry_limit} onChange={e => set(\'retry_limit\', Number(e.target.value))} onWheel={e => e.currentTarget.blur()} />\n                <Hint>Амжилтгүй болоход хэдэн удаа дахин оролдох. Ихэвчлэн 1-2.</Hint>'
);

// Output Count: add onWheel + Hint
src = src.replace(
  '<input style={INP_S} type="number" min={1} max={4} value={draft.output_count} onChange={e => set(\'output_count\', Number(e.target.value))} />',
  '<input style={INP_S} type="number" min={1} max={4} value={draft.output_count} onChange={e => set(\'output_count\', Number(e.target.value))} onWheel={e => e.currentTarget.blur()} />\n                <Hint>Нэг удаад хэдэн зураг гаргах. Олон бол илүү credit зарцуулна.</Hint>'
);

// Cleanup checkbox: replace accentColor label with CustomCheckbox + Hint
src = src.replace(
  `            <Row>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
                <input type="checkbox" checked={draft.cleanup_enabled} onChange={e => set('cleanup_enabled', e.target.checked)} style={{ accentColor: '#7C3AED' }} />
                Cleanup идэвхжүүлэх
              </label>
            </Row>`,
  `            <Row>
              <CustomCheckbox
                checked={draft.cleanup_enabled}
                onChange={v => set('cleanup_enabled', v)}
                label="Cleanup идэвхжүүлэх"
              />
            </Row>
            <Hint>AI-ийн нэмэлт artifact (буруу текст, гажуудал) цэвэрлэх дараагийн алхам. Чанар сайжруулна, бага зэрэг удаашруулна.</Hint>`
);

// Allowed sizes: add Hint after chips div
src = src.replace(
  `              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Prompt`,
  `              </div>
              <Hint>Хэрэглэгчид сонгож болох хэмжээнүүд. Хэмжээ нь зургийн композиц, текст байрлалд нөлөөлнө.</Hint>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Prompt`
);

// ── 2. Basic tab: DarkSelect for Ангилал ──
src = src.replace(
  `            <Field flex={1}>
              <FL>Ангилал</FL>
              <select
                style={INP_S}
                value={draft.category_id}
                onChange={e => set('category_id', e.target.value)}
              >
                <option value="">— Сонгох —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>`,
  `            <Field flex={1}>
              <FL>Ангилал</FL>
              <DarkSelect value={draft.category_id} onChange={v => set('category_id', v)}>
                <option value="">— Сонгох —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </DarkSelect>
            </Field>`
);

// Статус DarkSelect
src = src.replace(
  `            <Field flex={1}>
              <FL>Статус</FL>
              <select style={INP_S} value={draft.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </Field>`,
  `            <Field flex={1}>
              <FL>Статус</FL>
              <DarkSelect value={draft.status} onChange={v => set('status', v)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </DarkSelect>
            </Field>`
);

// ── 3. FieldAccordion: DarkSelect for input_type ──
src = src.replace(
  `              <select
                style={INP_S}
                value={local.input_type}
                onChange={e => set('input_type', e.target.value)}
              >
                {['text','textarea','select','radio','checkbox','color','number','image','aspect_ratio'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>`,
  `              <DarkSelect value={local.input_type} onChange={v => set('input_type', v)}>
                {['text','textarea','select','radio','checkbox','color','number','image','aspect_ratio'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </DarkSelect>`
);

// ── 4. Flag checkboxes: CustomCheckbox ──
src = src.replace(
  `          <SectionTitle>Тэмдэглэгээ</SectionTitle>
          <Row gap={20}>
            {(['is_featured', 'is_trending', 'is_popular', 'is_new'] as const).map(flag => (
              <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
                <input
                  type="checkbox"
                  checked={draft[flag]}
                  onChange={e => set(flag, e.target.checked)}
                  style={{ accentColor: '#7C3AED' }}
                />
                {{ is_featured: 'Онцлох', is_trending: 'Trending', is_popular: 'Алдартай', is_new: 'Шинэ' }[flag]}
              </label>
            ))}
          </Row>`,
  `          <SectionTitle>Тэмдэглэгээ</SectionTitle>
          <Row gap={20}>
            {(['is_featured', 'is_trending', 'is_popular', 'is_new'] as const).map(flag => (
              <CustomCheckbox
                key={flag}
                checked={draft[flag]}
                onChange={v => set(flag, v)}
                label={{ is_featured: 'Онцлох', is_trending: 'Trending', is_popular: 'Алдартай', is_new: 'Шинэ' }[flag]}
              />
            ))}
          </Row>`
);

// requires_image checkbox
src = src.replace(
  `            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
              <input
                type="checkbox"
                checked={draft.requires_image}
                onChange={e => set('requires_image', e.target.checked)}
                style={{ accentColor: '#7C3AED' }}
              />
              Зураг оруулах шаардлагатай
            </label>`,
  `            <CustomCheckbox
              checked={draft.requires_image}
              onChange={v => set('requires_image', v)}
              label="Зураг оруулах шаардлагатай"
            />`
);

// FieldAccordion required + is_active
src = src.replace(
  `          <Row gap={16}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
              <input type="checkbox" checked={local.required} onChange={e => set('required', e.target.checked)} style={{ accentColor: '#7C3AED' }} />
              Заавал
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
              <input type="checkbox" checked={local.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#7C3AED' }} />
              Идэвхтэй
            </label>
          </Row>`,
  `          <Row gap={16}>
            <CustomCheckbox checked={local.required} onChange={v => set('required', v)} label="Заавал" />
            <CustomCheckbox checked={local.is_active} onChange={v => set('is_active', v)} label="Идэвхтэй" />
          </Row>`
);

// credit_override checkbox
src = src.replace(
  `              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#A1A1AA' }}>
                <input type="checkbox" checked={draft.credit_override} onChange={e => set('credit_override', e.target.checked)} style={{ accentColor: '#7C3AED' }} />
                Override идэвхжүүлэх
              </label>`,
  `              <CustomCheckbox
                checked={draft.credit_override}
                onChange={v => set('credit_override', v)}
                label="Override идэвхжүүлэх"
              />`
);

// ── 5. Credit tab: base cost scroll prevention + Hints ──
src = src.replace(
  `                onChange={e => set('credit_cost', Math.max(1, Number(e.target.value)))}
              />`,
  `                onChange={e => set('credit_cost', Math.max(1, Number(e.target.value)))}
                onWheel={e => e.currentTarget.blur()}
              />
              <Hint style={{ marginTop: 8 }}>Энэ preset-ийг ашиглахад хэрэглэгчээс хасах credit.</Hint>`
);

// credit_override Admin Override hint
src = src.replace(
  `          <Card>
            <SectionTitle>Admin Override</SectionTitle>
            <Row>
              <CustomCheckbox`,
  `          <Card>
            <SectionTitle>Admin Override</SectionTitle>
            <Hint>Авто тооцоог үл хэрэгсэж credit-ийг гараар тогтоох. Шалтгаан заавал бичнэ.</Hint>
            <Row style={{ marginTop: 10 }}>
              <CustomCheckbox`
);

// ── 6. Required * in basic tab ──
src = src.replace(
  '<FL>Нэр *</FL>',
  '<FL>Нэр <Req /></FL>'
);

// ── 7. Hint accepts optional style prop ──
// Already handled by passing style via div (need to fix Hint to accept style)
src = src.replace(
  'function Hint({ children }: { children: React.ReactNode }) {\n  return (\n    <div style={{ fontSize: 11, color: \'#52525B\', marginTop: 5, lineHeight: 1.5 }}>\n      {children}\n    </div>\n  )\n}',
  'function Hint({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {\n  return (\n    <div style={{ fontSize: 11, color: \'#52525B\', marginTop: 5, lineHeight: 1.5, ...style }}>\n      {children}\n    </div>\n  )\n}'
);

fs.writeFileSync('src/components/admin/PresetEditorClient.tsx', src, 'utf8');

// Verify counts
const checkmarks = [
  ['Hint component added', src.includes('function Hint(')],
  ['CustomCheckbox added', src.includes('function CustomCheckbox(')],
  ['DarkSelect added', src.includes('function DarkSelect(')],
  ['Primary provider hint', src.includes('Үндсэн AI үйлчилгээ')],
  ['Fallback hint', src.includes('Үндсэн амжилтгүй')],
  ['Quality hint', src.includes('Standard — хурдан')],
  ['Retry hint', src.includes('Ихэвчлэн 1-2')],
  ['Output hint', src.includes('Нэг удаад хэдэн зураг')],
  ['Cleanup hint', src.includes('artifact')],
  ['Sizes hint', src.includes('зургийн композиц')],
  ['Base credit hint', src.includes('хэрэглэгчээс хасах credit')],
  ['Admin override hint', src.includes('Авто тооцоог')],
  ['onWheel blur (retry)', src.includes("retry_limit} onWheel")],
  ['onWheel blur (output)', src.includes("output_count} onWheel")],
  ['onWheel blur (credit_cost)', src.includes("credit_cost)} onWheel")],
  ['No accentColor checkboxes remain', !src.includes("accentColor: '#7C3AED'")],
  ['Req component used', src.includes('<Req />')],
  ['DarkSelect used for Ангилал', src.includes('DarkSelect value={draft.category_id}')],
  ['DarkSelect used for Статус', src.includes('DarkSelect value={draft.status}')],
];

let allOk = true;
for (const [label, ok] of checkmarks) {
  console.log((ok ? '✓' : '✗'), label);
  if (!ok) allOk = false;
}
console.log(allOk ? '\n✓ All checks passed' : '\n✗ Some checks failed');
