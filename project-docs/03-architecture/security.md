# Security Notes

## Current Phase

The app is static and frontend-only. There are no secrets, API routes, auth flows, payment flows, or generation calls.

## Future Requirements

- Never expose AI provider keys to the client.
- Never expose prompt templates or admin controls to public clients.
- Keep payment verification server-side.
- Use server-side credit ledger validation.
- Validate uploads before generation.
- Protect admin routes and APIs.
- Avoid trusting client-reported credit costs.
