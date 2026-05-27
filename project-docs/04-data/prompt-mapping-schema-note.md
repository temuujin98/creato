# Prompt Mapping Schema Note

## Overview

Phase 13D adds an admin-only UI shell for option-to-prompt mapping. No SQL migration is created in this phase, and no mapping data is exposed to public product pages.

## Why This Is Admin-Only

Visible product options are safe for the client, but prompt mapping rules can reveal how `creato` compiles prompts. Mapping text must stay in secure admin/backend storage and must not be included in public product APIs.

## Possible Future Approaches

### Option A: Add Column To `product_options`

```sql
alter table public.product_options
add column prompt_mapping text;
```

This is simple, but it only supports one mapping per visible option.

### Option B: Separate Mapping Table

```sql
create table public.product_option_prompt_mappings (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  choice_value text,
  prompt_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

This supports per-choice mappings and richer future workflows.

## Recommendation

Use a separate `product_option_prompt_mappings` table when Phase 13E or a later admin CRUD phase needs real persistence. Keep RLS admin-only and never return mapping rows to public client APIs.
