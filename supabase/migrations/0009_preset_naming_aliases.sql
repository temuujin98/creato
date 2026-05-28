-- creato Phase 16 preset naming aliases.
-- Keep legacy physical product tables stable for MVP compatibility.
-- Public and admin terminology is Preset.

create or replace view public.presets
with (security_invoker = true)
as
select * from public.products;

create or replace view public.preset_translations
with (security_invoker = true)
as
select * from public.product_translations;

create or replace view public.preset_options
with (security_invoker = true)
as
select * from public.product_options;

create or replace view public.preset_option_choices
with (security_invoker = true)
as
select * from public.product_option_choices;

revoke all on public.presets from anon, authenticated;
revoke all on public.preset_translations from anon, authenticated;
revoke all on public.preset_options from anon, authenticated;
revoke all on public.preset_option_choices from anon, authenticated;

comment on table public.products is
  'Legacy internal physical table name. Public UI term is Preset. Use public.presets alias for preset-named reads where appropriate.';
comment on table public.product_translations is
  'Legacy internal physical table name. Public UI term is Preset translation. Use public.preset_translations alias where appropriate.';
comment on table public.product_options is
  'Legacy internal physical table name. Public UI term is Preset option. Use public.preset_options alias where appropriate.';
comment on table public.product_option_choices is
  'Legacy internal physical table name. Public UI term is Preset option choice. Use public.preset_option_choices alias where appropriate.';

comment on view public.presets is
  'Preset-named alias over legacy public.products. Security invoker keeps underlying table policies authoritative.';
comment on view public.preset_translations is
  'Preset-named alias over legacy public.product_translations. Security invoker keeps underlying table policies authoritative.';
comment on view public.preset_options is
  'Preset-named alias over legacy public.product_options. Security invoker keeps underlying table policies authoritative.';
comment on view public.preset_option_choices is
  'Preset-named alias over legacy public.product_option_choices. Security invoker keeps underlying table policies authoritative.';
