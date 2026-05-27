# Generation Error, Retry, And Fallback Plan

## Overview

Generation processing must be retryable, auditable, and safe for wallet settlement. The worker should retry transient provider failures, use fallback provider routing only when configured, and refund reserved credits when all attempts fail.

## Retry Policy

Recommended MVP policy:

1. Attempt primary provider.
2. Retry primary provider once for transient errors.
3. If fallback provider is configured, attempt fallback once.
4. If all attempts fail, mark generation failed and refund reserved credits.

`model_configs.retry_limit` should cap provider retries.

## Error Categories

Use stable `generations.error_code` values:

| Code | Meaning |
| --- | --- |
| `validation_error` | Request or generation state is invalid. |
| `prompt_config_missing` | No active prompt version exists. |
| `model_config_missing` | No active model config exists. |
| `storage_input_missing` | Uploaded input file is missing or inaccessible. |
| `provider_auth_error` | Provider API key/config rejected. |
| `provider_rate_limit` | Provider rate limit or quota issue. |
| `provider_safety_block` | Provider blocked the request for safety reasons. |
| `provider_timeout` | Provider timed out. |
| `provider_unknown_error` | Provider failed without a classified reason. |
| `output_storage_failed` | Generated output could not be uploaded. |
| `wallet_spend_failed` | Output succeeded but wallet spend failed. |
| `wallet_refund_failed` | Failure happened but refund failed. |

## User-Visible Messages

Users should see simple messages:

- Generation is processing.
- Generation failed and credits were refunded.
- Generation failed and support/admin review is needed.
- Output is ready.

Users should not see:

- Prompt text.
- Provider raw response.
- API key/config details.
- Internal stack traces.
- Sensitive provider safety payloads.

## Internal Logs

Admin-only logs may include:

- Error stage.
- Provider name.
- Model id.
- Retry attempt.
- Sanitized provider message.
- Request id or trace id.
- Wallet settlement status.

Do not store secrets, full prompts, or raw sensitive provider responses in logs.

## Stored Generation Error Fields

Use:

```text
generations.error_code
generations.error_message
generations.metadata
```

`error_message` should be sanitized and short. Detailed provider diagnostics should go into admin-only logs if needed.

## Fallback Provider Rules

Fallback is allowed only when:

- `model_configs.fallback_provider` exists.
- `model_configs.fallback_model` exists.
- The failure category is retryable or fallback-eligible.
- The prompt and input format can be adapted to the fallback provider.

Fallback should not happen for:

- Invalid generation ownership.
- Missing prompt/model config.
- Missing input files.
- Wallet reserve missing.
- Safety blocks unless admin policy explicitly allows alternative handling.

## Admin Monitoring Needs

Admin UI should eventually show:

- Processing queue.
- Attempts per generation.
- Provider used.
- Fallback used.
- Error code.
- Wallet settlement status.
- Output storage status.
- Retry/refund recovery actions.

## Timeout Handling

Jobs stuck in `queued` or `processing` should be detected by scheduled recovery:

1. Find jobs older than threshold.
2. Check whether output rows exist.
3. Check wallet reserved state.
4. Retry, mark failed, or refund according to recovery rules.

## Wallet Failure Behavior

If `wallet_spend_failed` occurs after output success:

- Do not refund automatically.
- Keep output available.
- Flag admin recovery.
- Retry spend with `spend:{generationId}`.

If `wallet_refund_failed` occurs after generation failure:

- Keep generation failed.
- Flag admin recovery.
- Retry refund with `refund:{generationId}`.

## Phase 14C-A Gemini Safety Mapping

The Gemini adapter implementation spec adds provider-specific planning for:

- `provider_safety_block`
- `provider_auth_error`
- `provider_rate_limit`
- `provider_timeout`
- `provider_response_invalid`
- `output_storage_failed`

Safety blocks must fail the generation, refund reserved credits, and return only a user-safe message. Do not bypass provider safety systems, and do not expose raw safety payloads to users.

See:

```text
project-docs/03-architecture/gemini-adapter-implementation-spec.md
```
