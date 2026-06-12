# Creato

Монгол хэл дээрх prompt-free AI image generation studio.

Stack: Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase keys
pnpm dev
```

## Structure

- `src/app` — Next.js App Router pages
- `src/components/{ui,marketing,client,admin}` — component layers
- `src/lib` — shared utilities
- `src/server` — server-only code (route handlers, Supabase service client)
- `src/types` — TypeScript types
- `supabase/migrations` — all DB changes via migration files
- `design-reference` — pixel-perfect design source of truth

## Env vars

See `.env.example`.
