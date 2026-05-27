# ADR-003: Category Product Structure

## Status

Accepted

## Decision

Use a `Category -> Product` structure.

## Context

Users should start from a business use case category, then choose a specific creative workflow product.

## Consequences

- Static data can prepare for future product discovery.
- Product detail pages can later define image requirements, options, and credit costs.
- Admin tooling can later manage categories and products.
- Prompt and provider logic must stay backend-only.
