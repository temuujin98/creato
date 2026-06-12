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
    // imagen-4.0-fast-generate-001 works reliably on Google AI Studio keys.
    // imagen-4.0-generate-001 returns 0 images (RAI/quota) on free-tier keys.
    const model = opts.model || 'imagen-4.0-fast-generate-001'

    // Image-to-image: Imagen doesn't support reference images — use gemini-2.0-flash
    // which can understand an image and regenerate it with modified context.
    if (opts.inputImageBuffers && opts.inputImageBuffers.length > 0) {
      return this.generateWithImage(opts)
    }

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

    if (images.length === 0) {
      const reason = response.generatedImages?.[0]?.raiFilteredReason
      throw new Error(reason ? `gemini_rai_filtered: ${reason}` : 'gemini_no_images_returned')
    }
    return { images }
  }

  private async generateWithImage(opts: GenerateOptions): Promise<{ images: Buffer[] }> {
    // gemini-2.0-flash-preview-image-generation supports image output
    const buf = opts.inputImageBuffers![0]
    const b64 = buf.toString('base64')

    const response = await this.client.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: b64,
              },
            },
            { text: opts.prompt },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    })

    const images: Buffer[] = []
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        images.push(Buffer.from(part.inlineData.data, 'base64'))
      }
    }

    if (images.length === 0) throw new Error('gemini_no_images_returned_img2img')
    return { images }
  }
}
