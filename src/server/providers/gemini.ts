import 'server-only'
import { GoogleGenAI } from '@google/genai'
import type { ImageProvider, GenerateOptions } from './types'

// Aspect ratio → Gemini generateContent image size hint
// gemini-2.5-flash-image accepts aspectRatio in the config
function toAspectRatio(size: string): string {
  // size is already in "W:H" format matching Gemini's expected values
  const MAP: Record<string, string> = {
    '1:1': '1:1',
    '4:5': '4:5',
    '9:16': '9:16',
    '16:9': '16:9',
    '3:4': '3:4',
  }
  return MAP[size] ?? '1:1'
}

export class GeminiProvider implements ImageProvider {
  private client: GoogleGenAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  async generate(opts: GenerateOptions): Promise<{ images: Buffer[] }> {
    const model = opts.model || 'gemini-2.5-flash-image'

    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = []
    if (opts.inputImageBuffers && opts.inputImageBuffers.length > 0) {
      for (const buf of opts.inputImageBuffers) {
        imageParts.push({
          inlineData: {
            mimeType: 'image/png',
            data: buf.toString('base64'),
          },
        })
      }
    }

    const textPart = {
      text: opts.negativePrompt
        ? `${opts.prompt}\n\nAvoid: ${opts.negativePrompt}`
        : opts.prompt,
    }

    const response = await this.client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [...imageParts, textPart],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
        candidateCount: opts.outputCount ?? 1,
      },
    })

    const images: Buffer[] = []
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        images.push(Buffer.from(part.inlineData.data, 'base64'))
      }
    }

    if (images.length === 0) {
      const candidate = response.candidates?.[0]
      const finishReason = candidate?.finishReason
      const safetyRatings = candidate?.safetyRatings
      const detail = finishReason
        ? `finish_reason=${finishReason}`
        : safetyRatings
          ? `safety_blocked`
          : 'no_images_returned'
      throw new Error(`gemini_${detail}`)
    }

    return { images }
  }
}
