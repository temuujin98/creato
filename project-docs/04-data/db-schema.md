# creato Data Schema Plan

## Overview

This document defines the planned Supabase/Postgres data model for `creato`. It is implementation planning only. No Supabase client, API route, migration, or backend integration is implemented in Phase 6.

The future backend must support:

- Category -> Product discovery.
- User accounts and profiles.
- Credit wallets with ledger-backed transactions.
- Payments and credit packages.
- Image generation jobs with inputs, outputs, provider metadata, and auditability.
- Admin-only prompt versions and model routing configuration.
- Multilingual public content for Mongolian-first UI with English support.

## Design Principles

- Use UUID primary keys for all application tables.
- Use `timestamptz` for timestamps.
- Use `integer` for credit amounts.
- Use `numeric(12,2)` for money and provider costs.
- Enable RLS on all user-owned or admin-managed tables.
- Keep public product data separate from admin-only prompt/model configuration.
- Never expose service role keys to the client.
- Never return hidden prompt/config fields from public client APIs.
- Use signed URLs or protected buckets for generated and uploaded media.
- Preserve a complete audit trail for wallet changes, generation state changes, and admin actions.

## Enum Strategy

Use Postgres enums for stable state machines and constrained operational values. Use lookup tables only when non-developers need to add values without migrations.

Suggested enums:

```sql
create type user_role as enum ('user', 'admin', 'support');
create type wallet_transaction_type as enum (
  'purchase',
  'bonus',
  'reserve',
  'spend',
  'refund',
  'admin_adjustment',
  'expiry'
);
create type payment_status as enum ('pending', 'paid', 'failed', 'canceled', 'refunded');
create type generation_status as enum (
  'created',
  'credit_reserved',
  'queued',
  'processing',
  'completed',
  'failed',
  'credit_spent',
  'credit_refunded',
  'canceled'
);
create type media_kind as enum ('input', 'output');
create type prompt_status as enum ('draft', 'active', 'archived');
create type model_config_status as enum ('draft', 'active', 'disabled');
```

## Table List

1. `profiles`
2. `wallets`
3. `wallet_transactions`
4. `credit_packages`
5. `payments`
6. `categories`
7. `category_translations`
8. `products`
9. `product_translations`
10. `product_options`
11. `product_option_choices`
12. `option_translations`
13. `generations`
14. `generation_inputs`
15. `generation_outputs`
16. `prompt_versions`
17. `model_configs`
18. `admin_logs`

## Core Relationships

- `profiles.id` should reference `auth.users.id`.
- Each `profile` has one `wallet`.
- `wallet_transactions` belong to a wallet and may reference a payment or generation.
- `payments` belong to a profile and may purchase a credit package.
- `categories` have many products.
- Public multilingual text lives in translation tables.
- `products` have visible product options and option choices.
- `generations` belong to users and products.
- `generation_inputs` and `generation_outputs` belong to generations.
- `prompt_versions` and `model_configs` are admin-only and referenced by generation records for auditability.

## RLS and Security Notes

- Enable RLS on all tables except internal-only tables if they are accessed solely through service role backend code. Prefer enabling RLS everywhere.
- Public users can read active categories, translations, products, visible options, and public pricing packages.
- Users can only read their own profile, wallet summary, wallet transactions, payments, generations, inputs, and outputs.
- Users cannot write wallet balances directly.
- Users cannot write generation outputs.
- Admin-only tables must not be available through anonymous or authenticated public policies.
- Backend functions using service role must enforce authorization in code and keep keys server-side.
- Storage should use private buckets for user uploads and generated outputs. Return signed URLs with short expiry.

## Future Multilingual Strategy

The public UI is Mongolian-first with English support. Store stable business entities in base tables and language-specific text in translation tables:

- `categories` -> `category_translations`
- `products` -> `product_translations`
- `product_options` and `product_option_choices` -> `option_translations`

Use `language_code text not null` with values such as `mn` and `en`. Add a unique index per translated parent and language. The app should fall back to Mongolian when a translation is missing.

## Table Details

### profiles

Purpose: User account profile data extending Supabase Auth.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | References `auth.users.id`; not generated separately. |
| email | text | Required, copied from auth for admin search. |
| display_name | text | Nullable. |
| role | user_role | Required, default `user`. |
| locale | text | Required, default `mn`. |
| created_at | timestamptz | Required, default `now()`. |
| updated_at | timestamptz | Required, default `now()`. |

Relationships: One `wallet`; many `payments`, `generations`, and `admin_logs`.

Indexes: `profiles(email)`, `profiles(role)`.

RLS: Users can select/update limited self fields. Only admins can see role and broader profile lists. Role changes must be service/admin only.

### wallets

Purpose: Stores current credit balance summary for quick reads.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| user_id | uuid | Required, unique, references `profiles(id)`. |
| balance_credits | integer | Required, default `0`; derived from ledger. |
| reserved_credits | integer | Required, default `0`. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: One profile; many wallet transactions.

Indexes: Unique `wallets(user_id)`.

RLS: Users can read only their own wallet. No direct client updates. Backend/service role updates balance inside transactions.

### wallet_transactions

Purpose: Immutable ledger of all credit movements.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| wallet_id | uuid | Required, references `wallets(id)`. |
| user_id | uuid | Required denormalized reference for RLS and queries. |
| type | wallet_transaction_type | Required. |
| amount_credits | integer | Required; positive for credit increase, negative for decrease/reserve. |
| balance_after | integer | Required snapshot after transaction. |
| reserved_after | integer | Required snapshot after transaction. |
| generation_id | uuid | Nullable, references `generations(id)`. |
| payment_id | uuid | Nullable, references `payments(id)`. |
| idempotency_key | text | Required for external or retried operations. |
| note | text | Nullable. |
| admin_user_id | uuid | Nullable, references `profiles(id)` for admin adjustments. |
| created_at | timestamptz | Required. |

Relationships: Wallet, user, optional generation, optional payment, optional admin.

Indexes: `wallet_transactions(user_id, created_at desc)`, `wallet_transactions(wallet_id, created_at desc)`, unique `wallet_transactions(idempotency_key)`.

RLS: Users can read their own ledger rows. Inserts/updates must be backend only. Ledger rows should never be updated except rare administrative correction workflows that are separately audited.

### credit_packages

Purpose: Public credit package catalog.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| slug | text | Required, unique. |
| name | text | Required public label such as Starter. |
| credits | integer | Required. |
| price_mnt | numeric(12,2) | Required. |
| is_active | boolean | Required, default true. |
| sort_order | integer | Required, default `0`. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Many payments.

Indexes: Unique `credit_packages(slug)`, `credit_packages(is_active, sort_order)`.

RLS: Public can read active packages. Admins manage packages.

### payments

Purpose: Tracks payment attempts and reconciliation.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| user_id | uuid | Required, references `profiles(id)`. |
| credit_package_id | uuid | Nullable, references `credit_packages(id)`. |
| provider | text | Required, e.g. `qpay`. |
| provider_payment_id | text | Nullable until provider creates invoice. |
| amount_mnt | numeric(12,2) | Required. |
| credits | integer | Required. |
| status | payment_status | Required, default `pending`. |
| idempotency_key | text | Required. |
| paid_at | timestamptz | Nullable. |
| raw_provider_payload | jsonb | Admin/backend only. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: User, optional credit package, wallet transaction on success.

Indexes: `payments(user_id, created_at desc)`, unique `payments(idempotency_key)`, unique partial `payments(provider, provider_payment_id)` where provider id is not null.

RLS: Users can read their own payment summaries. Raw provider payload should not be returned to clients. Creation and status updates happen server-side.

### categories

Purpose: Category records for product discovery.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| slug | text | Required, unique. |
| icon_key | text | Nullable public UI icon key. |
| is_active | boolean | Required, default true. |
| sort_order | integer | Required. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Many products; many translations.

Indexes: Unique `categories(slug)`, `categories(is_active, sort_order)`.

RLS: Public can read active categories. Admins manage all categories.

### category_translations

Purpose: Multilingual category text.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| category_id | uuid | Required, references `categories(id)` on delete cascade. |
| language_code | text | Required, e.g. `mn`, `en`. |
| name | text | Required. |
| description | text | Required. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Belongs to category.

Indexes: Unique `category_translations(category_id, language_code)`, `category_translations(language_code)`.

RLS: Public can read translations for active categories. Admins manage.

### products

Purpose: Public product metadata and generation requirements.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| slug | text | Required, unique. |
| category_id | uuid | Required, references `categories(id)`. |
| thumbnail_path | text | Nullable storage path or CDN URL. |
| credit_cost | integer | Required. |
| requires_image | boolean | Required. |
| min_images | integer | Required, default `0`. |
| max_images | integer | Required, default `0`. |
| input_mode | text | Required; `image`, `multi-image`, or `text-only`. |
| aspect_ratios | text[] | Nullable visible allowed ratios. |
| is_featured | boolean | Required, default false. |
| is_popular | boolean | Required, default false. |
| is_new | boolean | Required, default false. |
| is_active | boolean | Required, default true. |
| sort_order | integer | Required, default `0`. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Category, translations, options, generations, prompt versions.

Indexes: Unique `products(slug)`, `products(category_id, is_active)`, `products(is_featured, sort_order)`.

RLS: Public can read active products and safe visible fields only. Prompt mappings and provider configs must not exist in this table.

### product_translations

Purpose: Multilingual public product copy.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| product_id | uuid | Required, references `products(id)` on delete cascade. |
| language_code | text | Required. |
| name | text | Required. |
| short_description | text | Required. |
| description | text | Required. |
| guide | text | Required. |
| tags | text[] | Nullable public tags. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Belongs to product.

Indexes: Unique `product_translations(product_id, language_code)`, GIN index on `tags`.

RLS: Public can read translations for active products. Admins manage.

### product_options

Purpose: Public visible option schema for product forms.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| product_id | uuid | Required, references `products(id)` on delete cascade. |
| key | text | Required per product. |
| type | text | Required; text, textarea, select, radio, checkbox, color, number, aspect-ratio. |
| required | boolean | Required, default false. |
| default_value | jsonb | Nullable safe public default. |
| validation_rules | jsonb | Nullable public validation only. |
| sort_order | integer | Required. |
| is_active | boolean | Required, default true. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Product, choices, translations.

Indexes: Unique `product_options(product_id, key)`, `product_options(product_id, sort_order)`.

RLS: Public can read active options for active products. No prompt mapping fields here.

### product_option_choices

Purpose: Public visible choices for select/radio/aspect-ratio options.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| option_id | uuid | Required, references `product_options(id)` on delete cascade. |
| value | text | Required. |
| sort_order | integer | Required. |
| is_active | boolean | Required, default true. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Option, translations.

Indexes: Unique `product_option_choices(option_id, value)`, `product_option_choices(option_id, sort_order)`.

RLS: Public can read active choices for active public products.

### option_translations

Purpose: Multilingual labels/help text for options and choices.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| option_id | uuid | Nullable, references `product_options(id)` on delete cascade. |
| choice_id | uuid | Nullable, references `product_option_choices(id)` on delete cascade. |
| language_code | text | Required. |
| label | text | Required. |
| placeholder | text | Nullable. |
| help_text | text | Nullable. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Either option or choice. Add a check constraint requiring exactly one of `option_id` or `choice_id`.

Indexes: Unique partial index on `(option_id, language_code)` where `option_id is not null`; unique partial index on `(choice_id, language_code)` where `choice_id is not null`.

RLS: Public can read translations for active public options and choices. Admins manage.

### generations

Purpose: Tracks generation jobs and state transitions.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| user_id | uuid | Required, references `profiles(id)`. |
| product_id | uuid | Required, references `products(id)`. |
| status | generation_status | Required, default `created`. |
| credit_cost | integer | Required snapshot. |
| reserved_transaction_id | uuid | Nullable, references `wallet_transactions(id)`. |
| spend_transaction_id | uuid | Nullable, references `wallet_transactions(id)`. |
| refund_transaction_id | uuid | Nullable, references `wallet_transactions(id)`. |
| prompt_version_id | uuid | Nullable, references `prompt_versions(id)`; admin/backend only in APIs. |
| model_config_id | uuid | Nullable, references `model_configs(id)`; admin/backend only in APIs. |
| option_values | jsonb | Required safe user-submitted visible option values. |
| provider_job_id | text | Nullable admin/backend field. |
| provider_cost_mnt | numeric(12,2) | Nullable admin/backend field. |
| error_code | text | Nullable. |
| error_message | text | Nullable admin/backend detail. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |
| completed_at | timestamptz | Nullable. |

Relationships: User, product, inputs, outputs, wallet transactions, prompt version, model config.

Indexes: `generations(user_id, created_at desc)`, `generations(status, created_at)`, `generations(product_id, created_at desc)`.

RLS: Users can read their own generation summaries. Admin-only/provider/prompt/error details must be filtered in public APIs. Inserts should happen through backend validation.

### generation_inputs

Purpose: Stores metadata for user-uploaded inputs used by a generation.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| generation_id | uuid | Required, references `generations(id)` on delete cascade. |
| user_id | uuid | Required denormalized RLS reference. |
| storage_path | text | Required private bucket path. |
| mime_type | text | Required. |
| file_size_bytes | integer | Nullable. |
| width | integer | Nullable. |
| height | integer | Nullable. |
| sort_order | integer | Required. |
| created_at | timestamptz | Required. |

Relationships: Generation, user.

Indexes: `generation_inputs(generation_id, sort_order)`, `generation_inputs(user_id, created_at desc)`.

RLS: Users can read metadata for their own inputs. Actual file access via signed URLs or protected storage policy.

### generation_outputs

Purpose: Stores metadata for generated images.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| generation_id | uuid | Required, references `generations(id)` on delete cascade. |
| user_id | uuid | Required denormalized RLS reference. |
| storage_path | text | Required private bucket path. |
| mime_type | text | Required. |
| file_size_bytes | integer | Nullable. |
| width | integer | Nullable. |
| height | integer | Nullable. |
| seed | text | Nullable admin/backend detail. |
| provider_asset_id | text | Nullable admin/backend detail. |
| created_at | timestamptz | Required. |

Relationships: Generation, user.

Indexes: `generation_outputs(generation_id)`, `generation_outputs(user_id, created_at desc)`.

RLS: Users can read their own output metadata and get signed URLs. Provider details should not be exposed through public APIs.

### prompt_versions

Purpose: Admin-only prompt templates and prompt mapping rules.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| product_id | uuid | Required, references `products(id)`. |
| version | integer | Required per product. |
| status | prompt_status | Required, default `draft`. |
| base_prompt | text | Required admin-only. |
| negative_prompt | text | Nullable admin-only. |
| prompt_suffix | text | Nullable admin-only. |
| option_mapping | jsonb | Required admin-only mapping from public option values to prompt fragments. |
| created_by | uuid | Required, references `profiles(id)`. |
| created_at | timestamptz | Required. |
| activated_at | timestamptz | Nullable. |

Relationships: Product, creator admin, generations.

Indexes: Unique `prompt_versions(product_id, version)`, partial unique active prompt per product.

RLS: Admin/service only. Never expose rows to public clients.

### model_configs

Purpose: Admin-only model routing and provider settings.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| product_id | uuid | Nullable for global default or product-specific config. |
| status | model_config_status | Required. |
| primary_provider | text | Required admin-only. |
| primary_model | text | Required admin-only. |
| fallback_provider | text | Nullable admin-only. |
| fallback_model | text | Nullable admin-only. |
| retry_limit | integer | Required, default `1`. |
| timeout_seconds | integer | Required. |
| internal_cost_estimate_mnt | numeric(12,2) | Nullable admin-only. |
| config | jsonb | Nullable admin-only; no API keys. |
| created_by | uuid | Required, references `profiles(id)`. |
| created_at | timestamptz | Required. |
| updated_at | timestamptz | Required. |

Relationships: Optional product, admin creator, generations.

Indexes: `model_configs(product_id, status)`, partial active config index.

RLS: Admin/service only. API keys must live in environment variables or secret manager, not database rows.

### admin_logs

Purpose: Audit log for admin actions and security-sensitive events.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Default `gen_random_uuid()`. |
| admin_user_id | uuid | Required, references `profiles(id)`. |
| action | text | Required. |
| entity_type | text | Required. |
| entity_id | uuid | Nullable. |
| metadata | jsonb | Nullable, sanitized. |
| ip_address | inet | Nullable. |
| user_agent | text | Nullable. |
| created_at | timestamptz | Required. |

Relationships: Admin profile.

Indexes: `admin_logs(admin_user_id, created_at desc)`, `admin_logs(entity_type, entity_id)`, `admin_logs(action, created_at desc)`.

RLS: Admin/service only. Logs are append-only.
