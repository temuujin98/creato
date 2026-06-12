# Creato — Claude Design шинжилгээ (Design Review)

> Шалгасан файлууд: `Homepage v3.html`, `Admin App.html` (+ admin/*.jsx), `Client App.html` (+ client/*.jsx), `Login.html`, `Register.html`, chat түүхүүд
> Огноо: 2026-06-11

---

## 1. Homepage v3 — Ерөнхий дүгнэлт: ✅ Зөвшөөрөхөд ойрхон

### Сайн хийгдсэн зүйлс

- ✅ "C" mark бүрэн хасагдсан — header/footer хоёулаа text-only **Creato** wordmark
- ✅ Pricing section болон "Үнэ" nav бүрэн хасагдсан
- ✅ Nav зөв: Presets · Яаж ажилладаг · Жишээ бүтээлүүд · Тусламж + Нэвтрэх/Эхлэх CTA
- ✅ Hero browser mockup биш — floating preset card, input chips, output poster, badges (Prompt-free / 1 credit / ~15 сек), parallax
- ✅ Section бүр `data-section-key`, `data-section-type`, `data-sort-order` attribute-тэй — CMS логикт бэлэн
- ✅ Benefit strip — moving pill marquee, hover-д зогсдог
- ✅ How it works — 4 алхам, тэгш биш stagger layout, connected dashed line
- ✅ Showcase — editorial grid (1 том + жижиг картууд), hover reveal
- ✅ Creator section — хөнгөн, давамгайлаагүй, үнэ заагаагүй
- ✅ Final CTA — зөв copy, free credit-ийг хөнгөн дурдсан
- ✅ `prefers-reduced-motion` дэмжсэн, scroll reveal IntersectionObserver-тэй
- ✅ Hero secondary CTA "Яаж ажилладаг вэ" (Credit авах биш) — зөв

### Алдаа дутагдал / Сайжруулах зүйлс

| # | Асуудал | Хүнд байдал | Шийдэл |
|---|---|---|---|
| H1 | **Mobile navigation байхгүй** — 768px-ээс доош `.hnav` нуугддаг ч hamburger menu алга | 🔴 Өндөр | Hamburger + slide-down/drawer menu нэмэх |
| H2 | "Тусламж" линк `#help`-рүү заадаг ч энэ нь Final CTA section — жинхэнэ Тусламж/FAQ section байхгүй | 🟡 Дунд | FAQ section (`section_type: faq`) нэмэх эсвэл линкийг Final CTA гэж нэрлэхгүй тусдаа hely хуудас руу заах |
| H3 | Fake статистикууд: "48+ preset", "240+ хэрэглэгч ашигласан", "+12 reward credit" — launch үед худал мэдээлэл болно | 🟡 Дунд | Эдгээрийг CMS metadata-аас ирдэг болгох; launch-д бодит тоо эсвэл тоогүй хувилбар |
| H4 | Showcase-д Travel poster, Social post жишээ алга (spec §19-д байгаа) | 🟢 Бага | 1-2 карт нэмэх эсвэл CMS-ээс сонгодог тул OK |
| H5 | Hero доторх линкүүд prototype файлууд руу (`Client App.html`, `Login.html`) — production-д route болгох | 🟢 Бага | Implementation үед `/presets`, `/login`, `/register` болно |
| H6 | SEO meta (description, OG tags) алга | 🟢 Бага | Next.js metadata API-аар нэмэгдэнэ |

**Дүгнэлт:** Homepage v3-ийг H1 (mobile menu) болон H2 (Тусламж/FAQ)-г засаад баталж болно. Бусад нь implementation шатанд шийдэгдэнэ.

---

## 2. Admin Panel — Preset Editor: ❌ Спекээс хоцорсон (хамгийн чухал засвар)

`AdminPresetEditPage` нь спекийн §7, §8, §26-тай **нийцэхгүй** байна:

### Алдаа дутагдал

| # | Асуудал | Хүнд байдал |
|---|---|---|
| A1 | **"Prompt" болон "Оролт" тусдаа таб хэвээр** — спекээр нэг **"Prompt & Fields"** таб болж нэгдэх ёстой | 🔴 Өндөр |
| A2 | **[square_bracket] variable илрүүлэлт огт алга** — base prompt-д `[product_name]` гэх мэт variable байхгүй, илэрсэн variable → client field автоматаар үүсэх логик, warning, compiled prompt preview юу ч байхгүй | 🔴 Өндөр |
| A3 | **Credit таб-д "Creator reward credit" хэвээр байна** — спекээр хасах ёстой (ирээдүйн client-side marketplace логик) | 🔴 Өндөр |
| A4 | **Credit auto-calculation алга** — base credit + auto тооцоолсон preview + admin override toggle + override reason талбар байхгүй | 🔴 Өндөр |
| A5 | **"Test Generate" товч хэвээр байна** — provider integration бэлэн болтол хасах ёстой | 🟡 Дунд |
| A6 | **Model таб буруу провайдерууд** — DALL-E 3 / SDXL / Midjourney v6 / Local AI жагсаасан. Спекээр: Primary = Gemini, Fallback = OpenAI. Fallback provider/model, retry limit, cleanup enabled, output count талбарууд алга | 🔴 Өндөр |
| A7 | **Allowed output sizes олон сонголт биш** — нэг л size select байна. Спекээр preset бүрд хэд хэдэн зөвшөөрөгдсөн хэмжээ (1:1, 4:5, 9:16, 16:9, 3:4) сонгоно | 🟡 Дунд |
| A8 | **Дутуу талбарууд:** slug, short/full description тусдаа, user guide, upload guide text, min/max image count, allowed file types, max file size, prompt suffix, quality prompt, artifact cleanup prompt, internal admin note, prompt version, sort order | 🟡 Дунд |
| A9 | **Status зөвхөн checkbox** (Идэвхтэй/Онцлох/Тренд) — спекээр status = draft/active/hidden + flag-ууд (featured/trending/popular/new) тусдаа | 🟡 Дунд |
| A10 | **Images таб дутуу** — зөвхөн thumbnail + жишээ зураг. Input guide image болон client preview card алга | 🟡 Дунд |
| A11 | Quality сонголт "Стандарт/HD" — спекээр Standard / High / Premium | 🟢 Бага |

### Бусад admin хуудсууд

- ✅ Sidebar бүтэц спекийн §12-той ойролцоо (Dashboard, Presets, Reviews, Categories, Types, Models, Sizes, Quality, Users, Wallet, Packages, Payments, Org Requests, Generations, Ratings, Homepage CMS, Settings, Logs, Reports)
- ✅ Бүх table sort-той, №  дугаарлалттай, нэг font/өнгөтэй болсон (chat-д хүссэний дагуу)
- ✅ Dashboard chart-тай (Chart.js)
- 🟡 Wallet/Credit Adjustment: спекийн §11-ийн controlled adjustment urui (төрөл + шалтгаан + тэмдэглэл заавал, audit log) UI-д бүрэн тусаагүй — шалгаж бэхжүүлэх
- 🟡 Homepage CMS хуудас байгаа ч section бүрийн бүрэн model (layout_variant, background_variant, content_source, metadata, schedule) editor хэр гүйцэт вэ гэдгийг нягтлах

---

## 3. Client App: 🟡 Гол урсгал OK, нарийвчлал хэрэгтэй

- ✅ Хуудсууд: Dashboard, Presets, Preset Detail, Generate, My Images, My Presets, Create Preset, Credits, Billing, Transactions, Settings, Help, Company
- ✅ Credit package картууд chat-ийн дагуу засагдсан (Top tag, border, center modal)
- 🟡 **Generate flow-д credit breakdown** (base + quality + ...) болон reserve→spend→refund төлвүүд UI дээр тодорхой харагдах ёстой
- 🟡 Preset detail дээр prompt/model мэдээлэл огт харагдахгүй гэдгийг баталгаажуулах (одоо OK харагдаж байгаа ч implementation үед API түвшинд хамгаална)
- 🟢 Create Preset (creator marketplace) — ирээдүйн feature тул MVP-д идэвхгүй/hidden байж болно

---

## 4. Claude Design-д өгөх засварын prompt (бэлэн хуулаад өгнө)

Доорх prompt-ийг Claude Design чат руугаа шууд хуулж өг:

```
Admin App доторх Preset засварлах хуудсыг (AdminPresetEditPage) дараах байдлаар бүрэн шинэчил:

1. "Prompt" ба "Оролт" хоёр табыг нэгтгэж нэг "Prompt & Fields" таб болго:
   - Base prompt textarea дотор [product_name], [background_style], [brand_color], [promo_text] гэх мэт variable-ууд [square_bracket] хэлбэрээр бичигдэнэ.
   - Prompt доор "Илэрсэн variable-ууд" хэсэг: prompt доторх variable бүр автоматаар жагсаалтад field болж харагдана.
   - Field бүр дээр дарахад тохиргоо нээгдэнэ: field key, label, input type (text/textarea/select/radio/checkbox/color/number/image/aspect ratio), required, placeholder, help text, default value, choices, sort order, active.
   - Warning badge-ууд: prompt-д байгаа ч тохиргоогүй variable = улбар шар warning; тохируулсан ч prompt-д ашиглагдаагүй field = саарал warning.
   - Доод хэсэгт "Compiled prompt preview" card: жишээ утгуудаар variable-ууд солигдсон эцсийн prompt харагдана.
   - Negative prompt, prompt suffix, quality prompt, artifact cleanup prompt, internal admin note, prompt version талбаруудыг мөн энэ табд оруул.

2. Credit табыг шинэчил:
   - "Creator reward credit" талбарыг бүрэн хас.
   - Base credit input + "Авто тооцоолсон credit" read-only preview (provider/model/quality/size/count/cleanup-аас хамаарсан formula breakdown жижиг мөрөөр) + эцсийн client-facing credit.
   - "Admin override" toggle: асаавал override утга + заавал бөглөх "Шалтгаан" талбар гарч ирнэ.

3. Model таб:
   - Primary provider: Gemini / OpenAI (default Gemini), Primary model select.
   - Fallback provider + fallback model select.
   - Quality preset: Standard / High / Premium.
   - Retry limit (number), Cleanup enabled (toggle), Output count (number).
   - Allowed output sizes: олон сонголттой chip-ууд (1:1, 4:5, 9:16, 16:9, 3:4) — preset-д зөвшөөрөгдсөн хэмжээнүүд.

4. Үндсэн таб: slug, short description, full description, user guide, status select (Draft/Active/Hidden), sort order нэм. Онцлох/Тренд/Шинэ/Их ашиглагдсан flag-ууд checkbox хэвээр.

5. Зураг таб: thumbnail + example outputs дээр нэмээд "Input guide зураг" upload хэсэг, мөн баруун талд client дээр хэрхэн харагдахыг үзүүлэх "Client preview card" нэм.

6. Upload шаардлага: requires image toggle, min/max image count, allowed file types, max file size, upload guide text талбаруудыг Prompt & Fields эсвэл Үндсэн табд нэм.

7. "Test Generate" товчийг хас.

Мөн Homepage v3 дээр:
8. Mobile (768px-ээс доош) hamburger menu нэм — нав линкүүд + Нэвтрэх/Эхлэх CTA бүхий slide-down цэс.
9. "Тусламж" nav линкэнд зориулж жижиг FAQ section нэм (section_type: faq, accordion хэлбэр, 4-5 асуулт: credit гэж юу вэ, төлбөр хэрхэн төлөх, амжилтгүй generation-д credit буцаах уу, зураг хаана хадгалагдах, prompt бичих хэрэгтэй юу) — Final CTA-ийн өмнө байрлуул, data-section-key="faq".
10. "48+ preset", "240+ хэрэглэгч" гэх мэт тоонуудыг ерөнхий болго ("Олон төрлийн preset", "Хэрэглэгчид ашиглаж байна") эсвэл хас.
```

---

## 5. Дараагийн алхам

1. Дээрх prompt-оор Claude Design дээр засвараа хийлгэ.
2. Засвар батлагдмагц шинэ handoff bundle-ийг энэ чат/Claude Code-д өгөөд `03-implementation-roadmap.md`-ийн дарааллаар хэрэгжүүлнэ.
3. Homepage v3-ийг одоо ч хэрэгжүүлж эхэлж болно (H1, H2-г кодондоо шууд нэмээд явах сонголт бий) — admin editor-ийн засвар design дээр дуустал хүлээх шаардлагагүй.
