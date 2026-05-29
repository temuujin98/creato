# ADR-006: Admin / Client Page Structure

**Date:** 2026-05-29
**Status:** Accepted

## Context

As the Creato.mn codebase grows, admin and client pages need to be clearly separated. The question is whether to physically reorganise the source tree or document the intended structure for a later refactor.

## Current structure

```
src/pages/
  admin/
    categories/
    credit-packages/
    dashboard/
    generations/
    presets/
  DashboardPage.tsx
  GeneratePage.tsx
  HomePage.tsx
  LoginPage.tsx
  MyImagesPage.tsx
  PricingPage.tsx
  ProductDetailPage.tsx
  ProductsPage.tsx
  RegisterPage.tsx
  SettingsPage.tsx
```

Admin pages are already grouped under `src/pages/admin/`. Client pages live at the `src/pages/` root.

## Decision

**Do not physically move client pages at this time.**

Moving all client pages into `src/pages/client/` would require updating every import path across `src/router/index.tsx` and any other reference — a low-value, high-noise change with real breakage risk at this stage of active feature development.

The current structure is already readable:
- Any file under `src/pages/admin/` is admin-only, behind `ProtectedRoute requireAdmin`.
- Files at `src/pages/*.tsx` root are public/authenticated client routes.

## Target structure (future refactor, not blocking)

```
src/pages/
  admin/
    categories/
    credit-packages/
    dashboard/
    generations/
    presets/
  client/
    DashboardPage.tsx
    GeneratePage.tsx
    HomePage.tsx
    LoginPage.tsx
    MyImagesPage.tsx
    PricingPage.tsx
    ProductDetailPage.tsx
    ProductsPage.tsx
    RegisterPage.tsx
    SettingsPage.tsx
```

When the feature set stabilises and a dedicated refactor sprint is appropriate, move client pages into `src/pages/client/` and update all router imports in a single atomic commit.

## Consequences

- No immediate source changes; build stays clean.
- New client pages created before the refactor should follow the existing flat pattern.
- New admin pages must go under `src/pages/admin/<feature>/`.
