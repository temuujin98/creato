# Creato — Төслийн тойм

> Repo: `github.com/temuujin98/creato` · Stack: Next.js + Supabase + Vercel
> Сүүлд шинэчилсэн: 2026-06-11

## Юу вэ

Creato бол Монгол хэл дээрх, **prompt бичих шаардлагагүй** AI creative studio. Хэрэглэгч бэлэн preset сонгож, энгийн талбаруудыг бөглөөд, credit зарцуулан бизнесийн visual үүсгэнэ.

**Гол позиционинг:** "Prompt бичихгүйгээр preset ашиглаад бизнесийн visual бүтээдэг AI studio."

## Бизнес загвар

- Credit-based: **1 credit = 990₮**
- Credit багц: 10 / 25 / 50 / 100 / Байгууллага
- Preset бүр тогтсон credit зарцуулна (provider, model, чанар, хэмжээ, тоо, оролтын зураг, cleanup, retry-аас хамаарч тооцоологдоно)
- Амжилттай үед л credit хасагдана; амжилтгүй бол автоматаар буцаана
- Төлбөр: Bonum (fee тохируулагдах, default 0)

## Зорилтот хэрэглэгч

FB/IG худалдаачид, онлайн дэлгүүр, ресторан/кафе, гоо сайхны салон, fashion, жижиг бизнес, freelancer/маркетер, аяллын компани, үл хөдлөх, эвент зохион байгуулагч.

## Бүтэц

```
Category → Preset (гүн nested байхгүй, MVP)
```

MVP категориуд: Product Photo · Social Media Post · Food & Menu · Beauty & Fashion · Business Poster · Trend Templates

## Гол урсгал (client)

1. Бүртгүүлэх/нэвтрэх → trial credit
2. Category → Preset сонгох
3. Шаардлагатай зураг upload + талбар бөглөх + хэмжээ сонгох
4. Generate → credit шалгах → **reserve** → backend дээр prompt угсрах → AI provider → My Images-д хадгалах
5. Амжилттай: credit spend / Амжилтгүй: refund
6. Үзэх, татах, устгах, settings дахин ашиглах, regenerate

## Аюулгүй байдлын алтан дүрэм

Client-д **хэзээ ч** илгээхгүй: base prompt, negative prompt, prompt mapping, model/provider config, internal cost, admin notes, API keys, cleanup prompt, fallback logic, service role keys.

Client-д очих зүйл: preset нэр, category, тайлбар, заавар, thumbnail, credit cost, upload шаардлага, харагдах option-ууд.

## Технологийн stack

| Давхарга | Сонголт |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind + shadcn/ui |
| Animation | Framer Motion |
| DB / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| Hosting | Vercel |
| AI provider | Gemini Image (default) · OpenAI image (premium/fallback) |
| Ирээдүйд | Cloudflare R2, Sentry/PostHog, i18n (en/ko/zh) |

## MVP дуусах шалгуур (товч)

- [ ] Бүртгэл/нэвтрэлт + trial credit
- [ ] Category/Preset browse + preset detail
- [ ] Зураг upload + option бөглөх + generate
- [ ] Credit reserve → success-д spend, fail-д auto-refund
- [ ] My Images: үзэх/татах/устгах
- [ ] Admin: category, preset CRUD, Prompt & Fields, credit тохиргоо, Gemini/OpenAI сонголт
- [ ] Prompt/config client-д хэзээ ч задрахгүй
- [ ] Admin basic analytics
- [ ] Homepage: dark, premium, залуу, CMS-controlled
