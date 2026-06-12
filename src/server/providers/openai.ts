import 'server-only'
import OpenAI, { toFile } from 'openai'
import type { ImageProvider, GenerateOptions } from './types'

function toOpenAISize(size: string): '1024x1024' | '1024x1536' | '1536x1024' {
  if (size === '9:16') return '1024x1536'
  if (size === '16:9') return '1536x1024'
  return '1024x1024'
}

export class OpenAIProvider implements ImageProvider {
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async generate(opts: GenerateOptions): Promise<{ images: Buffer[] }> {
    const model = opts.model || 'gpt-image-1'
    const size = toOpenAISize(opts.size)
    const n = Math.min(opts.outputCount, 10)

    // Image-to-image: use images.edit when input buffers are provided
    if (opts.inputImageBuffers && opts.inputImageBuffers.length > 0) {
      return this.generateEdit(opts, model, size, n)
    }

    const response = await this.client.images.generate({
      model,
      prompt: opts.prompt,
      n,
      size,
    })

    return this.extractImages(response.data ?? [])
  }

  private async generateEdit(
    opts: GenerateOptions,
    model: string,
    size: '1024x1024' | '1024x1536' | '1536x1024',
    n: number,
  ): Promise<{ images: Buffer[] }> {
    const buf = opts.inputImageBuffers![0]
    // gpt-image-1 edit requires PNG
    const imageFile = await toFile(buf, 'input.png', { type: 'image/png' })

    const response = await this.client.images.edit({
      model,
      image: imageFile,
      prompt: opts.prompt,
      n,
      size,
    })

    return this.extractImages(response.data ?? [])
  }

  private async extractImages(
    data: Array<{ b64_json?: string | null; url?: string | null }>,
  ): Promise<{ images: Buffer[] }> {
    const images: Buffer[] = []
    for (const item of data) {
      if (item.b64_json) {
        images.push(Buffer.from(item.b64_json, 'base64'))
      } else if (item.url) {
        const res = await fetch(item.url)
        if (!res.ok) throw new Error(`openai_image_fetch_failed: ${res.status}`)
        images.push(Buffer.from(await res.arrayBuffer()))
      }
    }
    if (images.length === 0) throw new Error('openai_no_images_returned')
    return { images }
  }
}
