-- Add profile fields used by the authenticated profile settings UI.
-- This is additive only and preserves existing profile rows.

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if to_regprocedure('public.set_updated_at()') is not null
    and not exists (
      select 1
      from pg_trigger
      where tgname = 'set_profiles_updated_at'
        and tgrelid = 'public.profiles'::regclass
    )
  then
    create trigger set_profiles_updated_at
      before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;
end $$;

comment on column public.profiles.avatar_url is
  'Storage path or safe URL for the user avatar shown in the UI.';

notify pgrst, 'reload schema';
