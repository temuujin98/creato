import 'server-only'
import { GoogleGenAI } from '@google/genai'
import type { ImageProvider, GenerateOptions } from './types'

export class GeminiProvider implements ImageProvider {
  private client: GoogleGenAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  async generate(opts: GenerateOptions): Promise<{ images: Buffer[] }> {
    // Default to imagen-4.0-generate-001 — imagen-3.x not available on v1beta API
    const model = opts.model || 'imagen-4.0-generate-001'

    const response = await this.client.models.generateImages({
      model,
      prompt: opts.prompt,
      config: {
        numberOfImages: opts.outputCount,
        aspectRatio: opts.size,
        outputMimeType: 'image/png',
      },
    })

    const images: Buffer[] = []
    for (const img of response.generatedImages ?? []) {
      if (img.image?.imageBytes) {
        images.push(Buffer.from(img.image.imageBytes, 'base64'))
      }
    }

    if (images.length === 0) throw new Error('gemini_no_images_returned')
    return { images }
  }
}
