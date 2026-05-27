# Generation Wallet Settlement

## Overview

`creato` uses a reserve-first wallet lifecycle. Credits are reserved before a generation is queued, then either spent after successful output persistence or refunded after failure.

Credits must not be permanently spent when the provider call starts. Spend only after output storage and database output rows are complete.

## Current Lifecycle

```text
reserve credits -> create generation -> queued/processing -> provider processing -> spend or refund
```

Current implemented preparation:

- Reserve credits through `reserve_credits`.
- Create `generations`.
- Create `generation_inputs`.
- Move generation to `queued` or `processing`.

Future AI completion:

- Store output.
- Insert `generation_outputs`.
- Mark completed.
- Spend reserved credits.

## Success Flow

1. Generation status is `processing`.
2. Provider returns output.
3. Output is uploaded to `generation-outputs`.
4. `generation_outputs` row is inserted.
5. Generation status is set to `completed`.
6. `spend_reserved_credits` is called.
7. Wallet transaction is recorded with idempotency key:

```text
spend:{generationId}
```

## Failure Flow

1. Provider error, validation error, storage error, or timeout occurs.
2. Generation status is set to `failed`.
3. `generations.error_code` stores a safe category.
4. `generations.error_message` stores a sanitized message.
5. `refund_reserved_credits` is called.
6. Wallet transaction is recorded with idempotency key:

```text
refund:{generationId}
```

## Partial Failure Rules

### Provider Succeeds But Storage Fails

- Do not insert `generation_outputs`.
- Mark generation `failed`.
- Store `output_storage_failed`.
- Refund reserved credits.
- Keep internal logs for admin investigation.

### Output Upload Succeeds But DB Insert Fails

- Do not spend credits.
- Mark generation `failed` if possible.
- Refund reserved credits.
- Admin recovery may later attach or delete orphaned storage output.

### DB Insert Succeeds But Spend Fails

- Keep generation `completed`.
- Store admin-visible settlement warning.
- Admin recovery must retry `spend_reserved_credits` with the same idempotency key.
- Do not call refund unless the output is invalidated.

### Refund Fails

- Mark generation `failed`.
- Store `wallet_refund_failed`.
- Admin recovery must retry refund using the same idempotency key.
- Never silently modify wallet balances without a ledger row.

## Idempotency Keys

Use stable keys per generation:

```text
spend:{generationId}
refund:{generationId}
```

Retries must reuse the same key so wallet RPC can return safely without duplicate settlement.

## Admin Recovery Requirements

Admin tooling should eventually support:

- Inspect stuck reserved credits.
- Retry failed generation.
- Retry wallet spend.
- Retry wallet refund.
- Manually refund with `admin_adjustment` when automated recovery fails.
- View linked wallet transaction ids per generation.

## Audit Requirements

Store enough information to reconstruct:

- Generation id.
- User id.
- Product id.
- Credit cost.
- Wallet transaction ids.
- Output row ids.
- Status timestamps.
- Error category and sanitized message.

Do not store prompt text in user-visible logs.
