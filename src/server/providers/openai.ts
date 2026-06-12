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
    // gpt-image-1 is the current OpenAI image generation model.
    // dall-e-3 is deprecated and no longer available on newer API versions.
    const model = opts.model || 'gpt-image-1'
    const size = toOpenAISize(opts.size)
    const n = Math.min(opts.outputCount, 10)

    const response = await this.client.images.generate({
      model,
      prompt: opts.prompt,
      n,
      size,
    })

    const images: Buffer[] = []
    for (const item of response.data ?? []) {
      if (item.b64_json) {
        // gpt-image-1 returns b64_json by default
        images.push(Buffer.from(item.b64_json, 'base64'))
      } else if (item.url) {
        // Fallback: fetch from URL
        const res = await fetch(item.url)
        if (!res.ok) throw new Error(`openai_image_fetch_failed: ${res.status}`)
        images.push(Buffer.from(await res.arrayBuffer()))
      }
    }

    if (images.length === 0) throw new Error('openai_no_images_returned')
    return { images }
  }
}
