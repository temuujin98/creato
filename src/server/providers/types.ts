import 'server-only'

export interface GenerateOptions {
  prompt: string
  negativePrompt: string | null
  model: string
  size: string        // e.g. "1:1", "16:9"
  outputCount: number
  // TODO Phase 4C: image-to-image — pass input image buffers to Gemini/OpenAI edit API
  inputImagePaths?: string[]
}

export interface ImageProvider {
  generate(opts: GenerateOptions): Promise<{ images: Buffer[] }>
}
