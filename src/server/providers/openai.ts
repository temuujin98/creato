import 'server-only'
import OpenAI from 'openai'
import type { ImageProvider, GenerateOptions } from './types'

type OpenAISize =
  | '256x256' | '512x512' | '1024x1024'
  | '1024x1792' | '1792x1024'
  | '1024x1024' // dall-e-3 square

// Map aspect ratio → closest DALL-E size
function toOpenAISize(size: string): '1024x1024' | '1024x1792' | '1792x1024' {
  if (size === '9:16') return '1024x1792'
  if (size === '16:9') return '1792x1024'
  return '1024x1024'
}

export class OpenAIProvider implements ImageProvider {
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async generate(opts: GenerateOptions): Promise<{ images: Buffer[] }> {
    const model = opts.model || 'dall-e-3'
    const size = toOpenAISize(opts.size)
    const n = model === 'dall-e-3' ? 1 : Math.min(opts.outputCount, 10)

    const response = await this.client.images.generate({
      model,
      prompt: opts.prompt,
      n,
      size,
      response_format: 'b64_json',
    })

    const images = (response.data ?? [])
      .filter((d) => d.b64_json)
      .map((d) => Buffer.from(d.b64_json!, 'base64'))

    if (images.length === 0) throw new Error('openai_no_images_returned')
    return { images }
  }
}
