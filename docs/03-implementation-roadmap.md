# Creato — Хэрэгжүүлэлтийн зам (Implementation Roadmap)

> Repo: `github.com/temuujin98/creato` · Имэйл: temuujinotgonchimeg98@gmail.com
> Connect хийгдсэн: GitHub ✅ Supabase ✅ Vercel ✅
> Алхам бүрд Claude Code (эсвэл энэ чат)-д өгөх **бэлэн prompt** хавсаргав.

---

## Дараалал (нэг харцаар)

| Phase | Юу хийх | Гарц |
|---|---|---|
| 0 | Repo scaffold + CI | Next.js app Vercel дээр deploy болсон |
| 1 | Supabase schema + RLS + Auth | DB migration, нэвтрэлт ажиллана |
| 2 | Homepage v4 | Public homepage live |
| 3 | Client: Presets browse + detail | Preset каталог |
| 4 | Generation engine | Generate → credit reserve/spend/refund → My Images |
| 5 | Admin panel | Preset editor (Prompt & Fields), CMS, wallet |
| 6 | Payments (Bonum) + credit багц | Бодит худалдан авалт |
| 7 | Polish + Launch checklist | Production |

> Дүрэм: Phase бүр дуусахад commit + push + Vercel preview шалгана. Нэг phase дуусаагүй бол дараагийнхыг эхлэхгүй.

---

## Phase 0 — Repo scaffold (v2 — 2026-06-11 шинэчилсэн)

**Гарц:** Next.js + TS + Tailwind + shadcn/ui суурь, дизайны эх файлууд + docs repo-д орсон, CLAUDE.md дүрэмтэй, CI ажиллаж, Vercel-д deploy болсон.

**Prompt (Claude Code-д хуулаад өг):**

```
temuujin98/creato repo дээр Creato төслийн суурийг scaffold хий. Creato бол Монгол хэл дээрх prompt-free AI image generation studio (Next.js + Supabase + Vercel).

1. SCAFFOLD
- pnpm + Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui.
- Бүтэц: src/app, src/components/{ui,marketing,client,admin}, src/lib, src/server, src/types, supabase/migrations, docs/, design-reference/.
- shadcn/ui init: button, input, textarea, select, dialog, tabs, badge, card, accordion, switch, table, tooltip, sonner(toast), skeleton.
- framer-motion, @supabase/supabase-js, @supabase/ssr суулга.

2. DESIGN REFERENCE (эх үнэн — заавал)
- Энэ дизайны handoff bundle-ийг татаж задал:
  https://api.anthropic.com/v1/design/h/7zF7fwHJD0nUJ-xhueWfpA
- creato/project/ доторх бүх файлыг (Homepage v3.html, Admin App.html, Client App.html, Login.html, Register.html, admin/*.jsx — pages-preset-edit.jsx орсон байх ёстой, client/*.jsx) repo-гийн design-reference/ фолдерт commit хий. Эдгээр нь дараагийн phase-уудын pixel-perfect лавлагаа.

3. DESIGN TOKENS
- design-reference/Homepage v3.html-ийн :root-оос CSS variables-ийг ЯГ хуулж src/app/globals.css-д тавь:
  --bg:#07060F; --bg2:#0C0B1A; --card:#12101F; --card2:#161427;
  --v:#8B5CF6; --vd:#7C3AED; --vl:#C4B5FD; --mag:#E879F9;
  --t:#F5F4FA; --tm:#8E8C9E; --tf:#4A4858;
  --bdr:rgba(255,255,255,.07); --bdrv:rgba(139,92,246,.25); --max:1180px;
- Tailwind-д semantic нэрээр map хий (bg, surface, card, violet, magenta, text-muted г.м.), darkMode:'class', html-д class="dark" default.
- Roboto-г next/font/google-оор холбо: weights 300,400,500,700,900; subsets ['latin','cyrillic'] — кирилл заавал.

4. CLAUDE.md (repo root — кодлох бүх session-д мөрдөх дүрэм)
Дотор нь бич:
- Төслийн товч: docs/01-project-overview.md-г унш.
- Дараалал: docs/03-implementation-roadmap.md-ийн phase-уудыг дагана.
- Pixel-perfect эх: design-reference/ доторх файлууд. UI-г таамаглахгүй, эндээс хуулна.
- АЮУЛГҮЙ БАЙДЛЫН АЛТАН ДҮРЭМ: base_prompt, negative_prompt, prompt_suffix, quality_prompt, cleanup_prompt, prompt_mapping, internal_note, provider/model config, estimated_cost, API keys, service role key — эдгээр CLIENT-Д ХЭЗЭЭ Ч очихгүй (API response whitelist, preset_public view, type түвшинд хамгаална).
- Credit урсгал: reserve → success-д spend / fail-д refund. Баланс зөвхөн RPC-ээр өөрчлөгдөнө.
- Бүх Supabase өөрчлөлт migration файлаар.
- UI текст монголоор, код/comment англиар. Commit message: conventional commits.
- Нууц түлхүүр repo-д хэзээ ч commit хийхгүй.

5. БУСАД
- .env.example: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, OPENAI_API_KEY, BONUM_API_KEY, BONUM_WEBHOOK_SECRET.
- docs/ фолдерт өгөгдсөн 01-04 md файлуудыг commit хий (05-design-v2-prompt.md = архив, ашиглахгүй — хүсвэл docs/archive/ дотор).
- GitHub Actions CI: push/PR бүрд pnpm typecheck + lint + build.
- Placeholder home page: түр "Creato — coming soon" (Phase 2-д солигдоно).
- README.md товч бичээд main руу push хий.
- Vercel-д холбож deploy хий; env-үүдийг placeholder-оор тохируулаад preview URL-ийг хариудаа өг.
```

---

## Phase 1 — Supabase schema + Auth

**Гарц:** `04-database-schema.md`-ийн schema migration болж орсон, RLS идэвхтэй, email нэвтрэлт ажиллана, шинэ хэрэглэгчид trial credit автоматаар орно.

**Prompt:**

```
docs/04-database-schema.md-г уншаад Supabase дээр хэрэгжүүл:

1. supabase/migrations дотор SQL migration файлууд үүсгээд Supabase MCP-ээр apply хий.
2. Бүх хүснэгтэд RLS асаа. Бодлого:
   - profiles: өөрийн мөрөө унших/засах.
   - presets: client зөвхөн status='active' мөрийн PUBLIC багана харна — үүний тулд preset_public view (эсвэл column-level хамгаалалт) хийж client зөвхөн view-г уншина. base_prompt, negative_prompt, prompt_suffix, quality_prompt, cleanup_prompt, internal_note, provider/model config, estimated_cost баганууд client-д ХЭЗЭЭ Ч харагдахгүй.
   - preset_fields: client зөвхөн is_active=true фийлдийн label/type/required/placeholder/help/choices/sort хэсгийг харна; prompt_mapping харагдахгүй.
   - wallets, wallet_transactions, generations: зөвхөн өөрийн мөр.
   - admin_* хүснэгтүүд: зөвхөн profiles.role='admin'.
3. handle_new_user() trigger: auth.users insert → profiles + wallets мөр үүсгэж 1 trial credit + wallet_transaction (type='trial') бичнэ.
4. Supabase Auth: email/password идэвхжүүл.
5. Next.js талд @supabase/ssr-ээр browser/server client helper, middleware (session refresh), /login /register хуудсууд (дизайны Login.html, Register.html-ийн дагуу) хий.
6. Storage buckets: 'uploads' (private, хэрэглэгчийн оруулсан зураг), 'outputs' (private, generation үр дүн), 'public-assets' (preset thumbnail, public). RLS бодлогуудыг бич.
7. Smoke test: бүртгүүлээд wallet-д 1 credit орж байгааг шалга, commit + push.
```

---

## Phase 2 — Homepage v4

**Гарц:** Дизайны `Homepage v3.html`-ийг pixel-perfect React болгож `/` дээр live болгоно.

**Prompt:**

```
Дизайны Homepage v4.html-ийг (design-reference/Homepage v4.html — v3-ийг орлосон эцсийн хувилбар) Next.js дээр хэрэгжүүл:

- src/app/(marketing)/page.tsx + section компонентууд: Hero, BenefitStrip, FeaturedPresets, HowItWorks, Showcase, CreatorCommunity, UseCases, FinalCta, Footer, Header.
- Бүх visual-ийг pixel-perfect хуул: hero floating composition (sale poster, preset card, input chips, 3 badge, 2 tile, parallax mousemove), marquee strip (hover-д зогсоно), preset card motif-ууд (m-sale, m-prod, m-food, m-beauty, m-ban, m-prof, m-trav, m-re), showcase editorial grid, creator visual, use case картууд, final CTA.
- Scroll reveal-ийг framer-motion whileInView-ээр, hero float-уудыг CSS keyframes хэвээр. prefers-reduced-motion дэмж.
- Section бүрийг props-оор удирдах боломжтой бүтэцтэй хий (дараа нь CMS-ээс өгөгдөл авна): { sectionKey, title, subtitle, isVisible, sortOrder, ctaLabel, ctaUrl, items }.
- Дизайнд байгаагүй 2 засварыг кодонд шууд нэм:
  1. Mobile hamburger menu (нав линкүүд + Нэвтрэх/Эхлэх).
  2. FAQ section (accordion, 5 асуулт, data-section-key="faq") — Final CTA-ийн өмнө.
- "48+ preset", "240+ хэрэглэгч" гэх hardcoded тоонуудыг props default болгож ерөнхий текстээр соль.
- Линкүүд: Preset үзэх → /presets, Нэвтрэх → /login, Эхлэх → /register.
- SEO: metadata (title, description, OG) монголоор.
- Lighthouse mobile 90+ байлга, push хийгээд Vercel preview өг.
```

---

## Phase 3 — Client: Preset browse + detail

**Гарц:** `/presets` каталог (category filter, badges), `/presets/[slug]` detail (зөвхөн public мэдээлэл).

**Prompt:**

```
Client preset каталогийг хий (дизайны Client App.html-ийн PresetsPage, PresetDetailPage дагуу):

- /presets: category tab/filter, preset card grid (thumbnail, нэр, category, богино use-case, credit badge, Шинэ/Онцлох/Тренд badge, hover lift). Өгөгдөл preset_public view-ээс.
- /presets/[slug]: thumbnail/example gallery, тайлбар, user guide, credit cost, upload шаардлага, "Үүсгэх" CTA (нэвтрээгүй бол /login руу).
- Server Components + Supabase server client ашигла; client-д prompt/model талбар очихгүйг типийн түвшинд баталгаажуул (PresetPublic type-д тэдгээр талбар огт байхгүй).
- Нэвтэрсэн хэрэглэгчийн layout: дизайны client/layout.jsx-ийн sidebar (Dashboard, Presets, My Images, Credits, Transactions, Settings, Help) + wallet badge.
- Seed: supabase/seed.sql-д 6 category, 8 preset (дизайны default featured жагсаалтаар) оруул.
```

---

## Phase 4 — Generation engine (хамгийн чухал)

**Гарц:** Бүрэн generate урсгал: option бөглөх → credit reserve → server-side prompt build → Gemini (fallback OpenAI) → Storage-д хадгалах → spend/refund → My Images.

**Prompt:**

```
Generation engine-ийг хий:

1. /presets/[slug]/generate хуудас: preset_fields-ээс динамик form (text/textarea/select/radio/checkbox/color/number/image upload/aspect ratio), allowed_sizes-аас хэмжээ сонгох, credit cost + үлдэгдэл харуулах, Generate товч.
2. Image upload: client → Supabase Storage 'uploads' bucket (signed upload), file type/size/count-ийг preset тохиргоогоор шалга.
3. POST /api/generate (route handler, service role зөвхөн server талд):
   a. Auth шалгах. b. Preset + fields server-ээс уншиж user input-ийг validate. c. reserve_credits(user, amount) RPC — wallet баланс шалгаад status='reserved' транзакц бичнэ (race-гүй, SELECT FOR UPDATE). d. generations мөр status='processing'. e. Prompt build: base_prompt доторх [variable]-уудыг prompt_mapping-аар хэрэглэгчийн утгаар соль + prompt_suffix + quality_prompt; negative prompt тусдаа. f. Gemini image API дууд; алдаа гарвал retry_limit хүртэл, дараа нь fallback OpenAI. g. Амжилт: үр дүнг 'outputs' bucket-д хадгалж generations мөр 'completed', spend_credits RPC (reserved→spent). h. Бүх оролдлого амжилтгүй: 'failed', refund_credits RPC (reserved→refunded, type='failed_generation_refund').
4. Client дээр generation status polling/realtime + урт ажиллагааны UI (progress, ~15 сек).
5. /my-images: grid, үзэх/татах (signed URL)/устгах/settings дахин ашиглах/regenerate.
6. Аюулгүй байдал: compiled prompt, provider response raw, model config — log хүснэгтэд хадгалж болно, гэхдээ client-д буцаах JSON-д ХЭЗЭЭ Ч оруулахгүй. API response-ийг whitelist хэлбэрээр бүтээ.
7. Unit test: prompt builder ([var] солилт, дутуу утга, mapping), credit reserve/spend/refund урсгал.
```

> ⏳ TODO: image upload component (requires_image presets) — Phase 4C

---

## Phase 5 — Admin panel

**Гарц:** Admin layout + Preset editor (Prompt & Fields, variable detection), categories, CMS, wallet adjustment, dashboard.

**Prompt (хэсэгчилж өгч болно — 5a, 5b, 5c):**

```
5a. Admin суурь:
- /admin route group, profiles.role='admin' middleware хамгаалалт.
- Дизайны admin/layout.jsx-ийн sidebar бүтцээр: Dashboard, Presets, Preset Review, Categories, Types, Models, Sizes, Quality, Users, Wallet, Credit Packages, Payments, Org Requests, Generations, Reviews, Homepage CMS, Settings, Logs, Reports.
- Бүх table: sort, № column, нэг font/style, status tag design (дизайны дагуу).

5b. Preset editor (хамгийн чухал, docs/02-design-review.md-ийн A1-A11 засваруудыг кодонд тусга):
- Табууд: Үндсэн / Модел & Чанар / Prompt & Fields / Зураг / Credit.
- Prompt & Fields: base prompt textarea → [variable] regex илрүүлэлт live → field жагсаалт автоматаар sync. Field бүр: key, label, type, required, placeholder, help, default, choices, prompt_mapping, sort, active. Warning: prompt-д байгаа ч тохиргоогүй variable / тохируулсан ч ашиглагдаагүй field. Compiled prompt preview (жишээ утгаар). Negative/suffix/quality/cleanup prompt, internal note, prompt version.
- Save validation: variable↔field mapping бүрэн байж draft→active болгоно.
- Модел таб: primary Gemini/OpenAI + model, fallback provider/model, quality Standard/High/Premium, retry limit, cleanup toggle, output count, allowed sizes multi-chip.
- Credit таб: base credit + авто тооцоолол preview (provider/model/quality/size/count/cleanup formula) + эцсийн credit + override toggle (шалтгаан заавал). Creator reward талбар БАЙХГҮЙ.
- Зураг таб: thumbnail, example outputs, input guide зураг, client preview card.
- Test Generate товч байхгүй.

5c. Бусад:
- Categories/Types/Models/Sizes/Quality CRUD.
- Users + user detail (wallet түүх, generations).
- Wallet Credit Adjustment: төрөл (refund/compensation/manual top-up/bonus/correction/failed gen reimbursement/other) + шалтгаан + тэмдэглэл заавал → wallet_transaction + admin_audit_log хоёуланг бичнэ. Энгийн "refund" товч байхгүй.
- Homepage CMS: homepage_sections CRUD (visible, sort, title, subtitle, layout/background variant, CTA, content_source, metadata, schedule) — Phase 2-ийн homepage эндээс өгөгдөл уншдаг болго.
- Dashboard: спекийн §12 метрикүүд + chart.
```

---

## Phase 6 — Payments (Bonum) + Credit багц

**Prompt:**

```
Credit худалдан авалтыг хий:
- credit_packages хүснэгт (10/25/50/100/байгууллага), admin CRUD.
- /credits хуудас: багц картууд (дизайны дагуу: border өнгөтэй, ТОП tag top-center, "Авах" товч, center modal).
- Bonum integration: /api/payments/create → invoice үүсгэх, /api/payments/webhook → амжилттай төлбөрт wallet_transaction (type='purchase') + credit нэмэх. Fee тохируулагдах (default 0). Webhook signature шалгана, idempotent болго.
- payments хүснэгт + admin Payments хуудас.
- Bonum API key байхгүй бол sandbox/mock adapter-тэйгээр бүтээж interface-ийг нь бэлэн болго.
```

---

## Phase 7 — Polish + Launch checklist

**Prompt:**

```
Launch бэлтгэл:
- Бүх хуудас mobile QA (375px), хоосон төлөв, алдааны төлөв, loading skeleton.
- Rate limiting /api/generate дээр (user тутамд), upload хэмжээ/төрлийн server шалгалт давхар.
- Client bundle-д SUPABASE_SERVICE_ROLE_KEY, GEMINI/OPENAI key орохгүйг шалга (next build analyze).
- RLS-ийг anon key-ээр бүх sensitive хүснэгтэд хандаж туршиж баталгаажуул.
- Sentry эсвэл энгийн error logging.
- docs/ доторх md-үүдийг шинэчилж production env-үүдийг Vercel дээр тохируул, custom domain холбо.
- MVP checklist (docs/01)-ийн бүх ☑-г шалгаад production deploy.
```

---

## Ажиллах горим (санамж)

- Алхам бүрийн дараа: `git commit` → `push` → Vercel preview линк шалгах.
- Supabase өөрчлөлт бүр migration файлаар (dashboard дээр гараар биш) — repo-д түүхтэй үлдэнэ.
- Нууц түлхүүрүүд зөвхөн Vercel env + локал .env.local; repo-д хэзээ ч commit хийхгүй.
- Дизайн засвар (Claude Design) ба Phase 2 зэрэгцэж явж болно; Phase 5b-г эхлэхээс өмнө admin editor-ийн шинэ дизайн гарсан байвал сайн, гараагүй бол docs/02-ийн спекээр шууд кодлоно.
