import 'server-only'
import OpenAI from 'openai'
import type { ImageProvider, GenerateOptions } from './types'

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
    // DALL-E 3 only supports n=1; other models support up to 10
    const n = model === 'dall-e-3' ? 1 : Math.min(opts.outputCount, 10)

    // Use URL response (default) — b64_json not supported by gpt-image-1
    const response = await this.client.images.generate({
      model,
      prompt: opts.prompt,
      n,
      size,
    })

    const images: Buffer[] = []
    for (const item of response.data ?? []) {
      if (item.url) {
        const res = await fetch(item.url)
        if (!res.ok) throw new Error(`openai_image_fetch_failed: ${res.status}`)
        const arrayBuf = await res.arrayBuffer()
        images.push(Buffer.from(arrayBuf))
      }
    }

    if (images.length === 0) throw new Error('openai_no_images_returned')
    return { images }
  }
}
