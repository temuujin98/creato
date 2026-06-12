import 'server-only'

export interface GenerateOptions {
  prompt: string
  negativePrompt: string | null
  model: string
  size: string        // e.g. "1:1", "16:9"
  outputCount: number
  inputImagePaths?: string[]
  // Phase 4D: populated by route handler when requires_image=true
  inputImageBuffers?: Buffer[]
}

export interface ImageProvider {
  generate(opts: GenerateOptions): Promise<{ images: Buffer[] }>
}
