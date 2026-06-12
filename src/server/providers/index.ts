import 'server-only'
import type { ImageProvider, GenerateOptions } from './types'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'

function makeProvider(name: string | null | undefined): ImageProvider {
  if (name === 'openai') return new OpenAIProvider()
  return new GeminiProvider() // default
}

interface RunWithRetryOptions extends Omit<GenerateOptions, 'model'> {
  primaryProvider: string
  primaryModel: string
  fallbackProvider: string | null
  fallbackModel: string | null
  retryLimit: number
}

export interface ProviderResult {
  images: Buffer[]
  providerUsed: string
  modelUsed: string
  attemptCount: number
}

/**
 * Tries primary provider up to retryLimit+1 times, then falls back to
 * fallback provider once. Throws if all attempts fail.
 */
export async function runWithRetry(opts: RunWithRetryOptions): Promise<ProviderResult> {
  const { primaryProvider, primaryModel, fallbackProvider, fallbackModel, retryLimit } = opts
  const maxAttempts = retryLimit + 1
  let lastError: unknown

  const genOpts: GenerateOptions = {
    prompt: opts.prompt,
    negativePrompt: opts.negativePrompt,
    model: primaryModel,
    size: opts.size,
    outputCount: opts.outputCount,
  }

  // Primary attempts
  const primary = makeProvider(primaryProvider)
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await primary.generate(genOpts)
      return {
        images: result.images,
        providerUsed: primaryProvider,
        modelUsed: primaryModel,
        attemptCount: i + 1,
      }
    } catch (err) {
      lastError = err
    }
  }

  // Fallback
  if (fallbackProvider) {
    const fallback = makeProvider(fallbackProvider)
    try {
      const result = await fallback.generate({
        ...genOpts,
        model: fallbackModel ?? genOpts.model,
      })
      return {
        images: result.images,
        providerUsed: fallbackProvider,
        modelUsed: fallbackModel ?? primaryModel,
        attemptCount: maxAttempts + 1,
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError ?? new Error('all_providers_failed')
}
