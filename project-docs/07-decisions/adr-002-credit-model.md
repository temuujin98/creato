# ADR-002: Credit Model

## Status

Accepted for product direction, not implemented operationally.

## Decision

Use credits as the future unit for consuming AI generation.

Current public pricing direction:

- 1 credit = 990 MNT
- Starter: 10 credits, 9,900 MNT
- Creator: 20 credits, 18,900 MNT
- Business: 50 credits, 44,900 MNT
- Pro: 100 credits, 79,900 MNT

## Consequences

- The homepage can explain pricing without implementing wallet or payment.
- Future backend must own credit ledger and validation.
- Credit data in Phase 1 is static placeholder data.
