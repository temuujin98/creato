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
  retryLimit: number
  inputImagePaths?: string[]
  inputImageBuffers?: Buffer[]
}

export interface ProviderResult {
  images: Buffer[]
  providerUsed: string
  modelUsed: string
  attemptCount: number
}

// Friendly display names — safe to surface to clients (no internal config)
const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
}

const MODEL_LABELS: Record<string, string> = {
  'gemini-2.5-flash-image': 'Gemini 2.5 Flash Image',
  'gemini-3-pro-image': 'Gemini 3 Pro Image',
  'gpt-image-1': 'GPT Image 1',
}

export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
}

export function modelLabel(model: string): string {
  return MODEL_LABELS[model] ?? model
}

export async function runWithRetry(opts: RunWithRetryOptions): Promise<ProviderResult> {
  const { primaryProvider, primaryModel, retryLimit } = opts
  const maxAttempts = retryLimit + 1
  let lastError: unknown

  const genOpts: GenerateOptions = {
    prompt: opts.prompt,
    negativePrompt: opts.negativePrompt,
    model: primaryModel,
    size: opts.size,
    outputCount: opts.outputCount,
    inputImageBuffers: opts.inputImageBuffers,
  }

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const provider = makeProvider(primaryProvider)
      const result = await provider.generate(genOpts)
      return {
        images: result.images,
        providerUsed: primaryProvider,
        modelUsed: primaryModel,
        attemptCount: i + 1,
      }
    } catch (err) {
      lastError = err
      console.error(
        `[provider] ${primaryProvider}/${primaryModel} attempt ${i + 1}/${maxAttempts} failed:`,
        err instanceof Error ? err.message : err
      )
    }
  }

  throw lastError ?? new Error('provider_exhausted')
}
