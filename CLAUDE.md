# CLAUDE.md — Creato Project Rules

Creato is a Mongolian-first, prompt-free AI image generation studio.
Stack: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel.

## Read first
- `docs/01-project-overview.md` — what the product is.
- `docs/03-implementation-roadmap.md` — phased plan. Follow phases in order; do not skip ahead.
- `docs/04-database-schema.md` — DB design (implemented in `supabase/migrations/`).

## Design source of truth
- `design-reference/Homepage v4.html` — THE homepage (v3 is superseded, kept for history).
- `design-reference/Client App.html` + `client/*.jsx` — client app screens.
- `design-reference/Admin App.html` + `admin/*.jsx` — admin screens (`pages-preset-edit.jsx` = preset editor).
- `design-reference/Login.html`, `Register.html` — auth pages.
- Copy these pixel-perfect. Do not invent UI. Keep CSS variables from `Homepage v4.html` `:root`.

## SECURITY GOLDEN RULES (never violate)
1. These NEVER reach the client (not in API responses, not in client bundles, not in client-readable tables/views):
   `base_prompt`, `negative_prompt`, `prompt_suffix`, `quality_prompt`, `cleanup_prompt`,
   `prompt_mapping`, `internal_note`, `compiled_prompt`, provider/model config, `estimated_cost`,
   API keys, `SUPABASE_SERVICE_ROLE_KEY`.
2. Client reads presets ONLY through `preset_public` / `preset_fields_public` views.
3. Client reads `generations` with EXPLICIT column lists only (column-level grants — `select('*')` will fail by design).
4. Prompt building, provider calls, credit mutations happen ONLY in server code (route handlers / server actions) using the service role or SECURITY DEFINER RPCs.
5. Wallet balance changes ONLY via RPCs: `reserve_credits`, `spend_credits`, `refund_credits`, `admin_adjust_credits`. Never UPDATE wallets directly.
6. Credit flow: reserve → (success) spend / (failure) refund. Credit is only truly spent on success.

## Engineering conventions
- All Supabase changes via files in `supabase/migrations/` (never dashboard-only changes).
- UI copy in Mongolian; code, comments, commit messages in English (conventional commits).
- Server Components by default; client components only when interactive.
- Types: `PresetPublic` type must structurally exclude all server-only fields.
- Secrets only in `.env.local` / Vercel env. Never commit secrets.
- After each phase: commit, push, verify Vercel preview.

## Current status
- Phase 0: scaffold — this package contains docs/, design-reference/, supabase/, CLAUDE.md to commit at repo root.
- Phase 1 SQL is ready in `supabase/migrations/` (0001 schema+RLS+RPC, 0002 storage) + `supabase/seed.sql`.
