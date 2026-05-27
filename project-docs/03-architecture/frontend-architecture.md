# Frontend Architecture

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Structure

```text
src/
  components/
    layout/
    home/
  content/
  data/
  lib/
  styles/
```

## Principles

- Keep content and data separate from components.
- Keep homepage sections isolated.
- Use typed static data.
- Avoid client-side secrets.
- Avoid backend behavior in the frontend foundation.

## Future Readiness

The frontend should be able to add:

- App shell.
- Auth-aware routes.
- Product detail flows.
- Upload UI.
- Credit checkout UI.
- Generation status UI.

These must wait for explicit future phases.
