# Social Login Setup

## Overview

creato supports Google and Facebook OAuth login via Supabase Auth. The frontend
calls `supabase.auth.signInWithOAuth` with the anon key (public). Provider
credentials are stored only in the Supabase Dashboard — never in the frontend.

## Google Login

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create an OAuth 2.0 client ID (Web application).
3. Add authorized redirect URIs:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - `http://localhost:5173/` (or your local dev port) — for local testing only
4. Copy Client ID and Client Secret.
5. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save
6. In Supabase Dashboard → Authentication → URL Configuration:
   - Add `http://localhost:5173` to Redirect URLs (for dev)
   - Add your production domain

## Facebook Login

1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Create a new App (type: Consumer or Business).
3. Add "Facebook Login" product to the app.
4. In Facebook Login settings → Valid OAuth Redirect URIs:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret from App Settings → Basic.
6. In Supabase Dashboard → Authentication → Providers → Facebook:
   - Enable Facebook provider
   - Paste App ID and App Secret
   - Save

## Redirect URLs

The frontend passes `redirectTo: window.location.origin + "/dashboard"`.

Supabase Dashboard → Authentication → URL Configuration must include all
origins where users can land:
- `http://localhost:5173` (dev)
- `http://localhost:5174` (alt dev port)
- `https://your-production-domain.com`

## Security Rules

- Provider Client Secret → Supabase Dashboard only. Never in `.env` or any
  `VITE_` variable. Never committed to source control.
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are unrelated and also
  never go in the frontend.
- The Supabase anon key (`VITE_SUPABASE_ANON_KEY`) is intentionally public —
  Row Level Security enforces data access.

## Profile Row for OAuth Users

When an OAuth user signs in for the first time, `AuthProvider.tsx` calls
`supabase.from("profiles").upsert(..., { ignoreDuplicates: true })` to
create a profile row using data from `user_metadata` (name, avatar from
Google/Facebook). If the row already exists, it is not overwritten —
user-edited data in the database is always the source of truth.

## Testing

1. Enable a provider in Supabase Dashboard.
2. Add redirect URLs.
3. On login/register page, click "Continue with Google" or "Continue with Facebook".
4. Browser redirects to OAuth provider → back to `/dashboard`.
5. Verify `profiles` row was created in the database.
6. Verify avatar (if provided by the OAuth provider) appears in the header.

## Related Documents

- [`supabase-setup.md`](./supabase-setup.md)
- [`gemini-billing-and-test-mode.md`](./gemini-billing-and-test-mode.md)
