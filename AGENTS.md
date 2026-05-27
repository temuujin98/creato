# AGENTS.md

Guidance for future coding agents working on `creato`.

## Working Rules

- Always inspect the project structure before coding.
- Work in small phases and keep each change easy to review.
- Do not rewrite the whole project at once.
- Keep UI Mongolian-first.
- Use `creato` as the visible brand name.
- Do not use `Creato.mn` as the visible brand name.
- Do not add a dot after the `creato` wordmark.
- Keep pricing and credit information out of the hero.
- Do not expose prompt, admin, AI provider, or generation orchestration logic to the client.
- Use a component-based structure.
- Prefer maintainable files over one large file.
- Anticipate future backend, admin, auth, credit, and generation features, but do not implement them in Phase 1.

## Current Phase Boundaries

Phase 0 creates the frontend foundation: Vite, React, TypeScript, Tailwind CSS, docs, and scalable folders.

Phase 1 creates the public homepage with static placeholder data only.

Do not implement backend, Supabase, auth, admin panel, payment, wallet, AI generation, API routes, uploads, or database logic until a future phase explicitly requests them.

## Frontend Structure

- `src/components/layout`: shared layout components.
- `src/components/home`: homepage sections.
- `src/content`: page-level copy.
- `src/data`: static placeholder data.
- `src/lib`: small reusable utilities.
- `src/styles`: global CSS and Tailwind entry.

## Product Model Direction

The product structure is `Category -> Product`.

Future products may:

- Require one or multiple images.
- Include configurable options.
- Consume credits.
- Trigger backend generation workflows.

Keep these ideas visible in data shape and documentation, but avoid implementing operational logic in the frontend until the backend phase exists.
