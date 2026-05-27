# Wallet Ledger Strategy

## Overview

`creato` uses credits to pay for generation products. The wallet must be ledger-based so every balance change is traceable, reversible when needed, and safe under retries or concurrent requests.

The UI may show a wallet balance, but the backend must treat the ledger as the audit source and the wallet summary as a cached projection.

## Why a Ledger-Based Wallet Is Required

A simple mutable balance is not enough because generation has multiple async outcomes:

- Payment webhooks may arrive more than once.
- Generation jobs can fail after credits are reserved.
- Admins may need to grant, correct, or expire credits.
- Users may click actions repeatedly.
- Workers may retry after timeouts.

Every wallet change must create an immutable `wallet_transactions` row. Never silently change `wallets.balance_credits` or `wallets.reserved_credits` without a ledger row.

## Wallet Balance Source of Truth

Recommended model:

- `wallet_transactions` is the source of truth for audit.
- `wallets.balance_credits` is a transactional summary of spendable credits.
- `wallets.reserved_credits` is a transactional summary of credits reserved for in-flight jobs.

All wallet writes must happen in a single database transaction:

1. Lock the wallet row with `select ... for update`.
2. Validate available balance.
3. Insert the ledger row with an idempotency key.
4. Update wallet summary fields.
5. Commit.

## Transaction Types

| Type | Meaning | Balance effect |
| --- | --- | --- |
| `purchase` | Credits bought through payment provider. | Increase spendable balance. |
| `bonus` | Promotional credits. | Increase spendable balance. |
| `reserve` | Temporarily reserves credits for a generation. | Decrease spendable, increase reserved. |
| `spend` | Finalizes a successful generation. | Decrease reserved. |
| `refund` | Returns reserved credits after failure/cancel. | Increase spendable, decrease reserved. |
| `admin_adjustment` | Manual admin correction or grant. | Increase or decrease spendable. |
| `expiry` | Removes expired credits if expiry is introduced. | Decrease spendable. |

## Generation Success Flow

Credits must not be permanently deducted until generation succeeds.

1. Reserve credits:
   - Insert `reserve` transaction for `-credit_cost`.
   - Update wallet: `balance_credits -= credit_cost`, `reserved_credits += credit_cost`.
   - Set generation status to `credit_reserved`.
2. Process generation:
   - Queue worker and call AI provider.
   - Store input/output metadata.
3. Spend reserved credits:
   - Insert `spend` transaction for `-credit_cost` against reserved credits.
   - Update wallet: `reserved_credits -= credit_cost`.
   - Set generation status to `completed` and then `credit_spent` if using separate audit states.

## Generation Failure Flow

1. Reserve credits.
2. Process generation.
3. If generation fails after reserve:
   - Insert `refund` transaction for `+credit_cost`.
   - Update wallet: `balance_credits += credit_cost`, `reserved_credits -= credit_cost`.
   - Set generation status to `failed` and then `credit_refunded` if using separate audit states.

## Transaction Lifecycle Examples

### Purchase

| Step | Event | Transaction |
| --- | --- | --- |
| 1 | QPay invoice paid webhook received | `purchase +20` |
| 2 | Wallet updated | balance increases by 20 |
| 3 | Payment marked paid | payment status `paid` |

### Successful Generation

| Step | Event | Transaction |
| --- | --- | --- |
| 1 | User starts a 2-credit product | `reserve -2` |
| 2 | Provider returns output | `spend -2` from reserved |
| 3 | Output stored | generation `completed` |

### Failed Generation

| Step | Event | Transaction |
| --- | --- | --- |
| 1 | User starts a 2-credit product | `reserve -2` |
| 2 | Provider fails | `refund +2` |
| 3 | Error logged | generation `credit_refunded` |

## Idempotency Requirements

Every external or retryable operation needs an idempotency key:

- Payment webhook: `payment:{provider}:{provider_payment_id}:paid`
- Generation reserve: `generation:{generation_id}:reserve`
- Generation spend: `generation:{generation_id}:spend`
- Generation refund: `generation:{generation_id}:refund`
- Admin adjustment: `admin:{admin_id}:{request_id}:adjustment`

`wallet_transactions.idempotency_key` must be unique. If a retry uses the same key, the backend should return the existing result instead of inserting a duplicate transaction.

## Race Condition Prevention

Use database row locks for wallet writes:

```sql
select *
from wallets
where user_id = :user_id
for update;
```

Rules:

- Do not read balance, then update later without a lock.
- Do not allow negative `balance_credits`.
- Do not allow negative `reserved_credits`.
- Keep transaction scopes small.
- Do wallet updates and generation status updates in the same transaction when possible.

## Admin Adjustment Rules

Manual admin changes must be explicit:

- Use only `admin_adjustment`.
- Require `admin_user_id`.
- Require a human-readable note.
- Store old and new balance snapshots in the ledger row.
- Write an `admin_logs` row.
- Never edit old ledger rows to "fix" balance.

## Audit Trail Requirements

Each wallet transaction should include:

- Wallet id.
- User id.
- Transaction type.
- Credit amount.
- Balance after.
- Reserved balance after.
- Related payment or generation id when applicable.
- Idempotency key.
- Admin id for manual changes.
- Timestamp.

## Example Ledger Rows

| type | amount_credits | balance_after | reserved_after | related object |
| --- | ---: | ---: | ---: | --- |
| purchase | 20 | 20 | 0 | payment `pay_001` |
| reserve | -2 | 18 | 2 | generation `gen_001` |
| spend | -2 | 18 | 0 | generation `gen_001` |
| reserve | -1 | 17 | 1 | generation `gen_002` |
| refund | 1 | 18 | 0 | generation `gen_002` |
| admin_adjustment | 5 | 23 | 0 | admin grant |

## QPay and Payment Reconciliation Notes

Future QPay integration should:

- Create a `payments` row before opening payment.
- Store provider invoice id.
- Process webhook using an idempotency key.
- Verify amount and package before crediting.
- Insert `purchase` ledger row only after confirmed paid status.
- Reconcile pending payments with scheduled checks.
- Never trust client-submitted payment status.
