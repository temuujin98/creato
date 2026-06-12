import 'server-only'
import type { ImageProvider, GenerateOptions } from './types'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'

function makeProvider(name: string | null | undefined): ImageProvider {
  if (name === 'openai') return new OpenAIProvider()
  return new GeminiProvider()
}

interface RunWithRetryOptions extends Omit<GenerateOptions, 'model'> {
  primaryProvider: string
  primaryModel: string
  fallbackProvider: string | null
  fallbackModel: string | null
  retryLimit: number
  inputImagePaths?: string[]
}

export interface ProviderResult {
  images: Buffer[]
  providerUsed: string
  modelUsed: string
  attemptCount: number
}

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

  // Primary attempts — provider constructed inside loop so constructor errors are caught
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const primary = makeProvider(primaryProvider)
      const result = await primary.generate(genOpts)
      return {
        images: result.images,
        providerUsed: primaryProvider,
        modelUsed: primaryModel,
        attemptCount: i + 1,
      }
    } catch (err) {
      lastError = err
      // Log server-side only — never reaches client
      console.error(`[provider] ${primaryProvider} attempt ${i + 1}/${maxAttempts} failed:`, err instanceof Error ? err.message : err)
    }
  }

  // Fallback — single attempt
  if (fallbackProvider) {
    try {
      const fallback = makeProvider(fallbackProvider)
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
      console.error(`[provider] fallback ${fallbackProvider} failed:`, err instanceof Error ? err.message : err)
    }
  }

  throw lastError ?? new Error('all_providers_failed')
}
