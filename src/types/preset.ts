export type PresetPublic = {
  id: string
  slug: string
  name: string
  short_description: string | null
  long_description: string | null
  credit_cost: number
  category_name: string | null
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_new: boolean
  example_image_urls: string[] | null
  sort_order: number | null
  // SECURITY: base_prompt, negative_prompt, prompt_suffix, quality_prompt,
  // cleanup_prompt, prompt_mapping, internal_note, provider/model config,
  // estimated_cost are intentionally absent.
}

export type PresetFieldPublic = {
  id: string
  field_key: string
  label: string
  field_type: string
  is_required: boolean
  placeholder_text: string | null
  help_text: string | null
  choices: unknown | null
  sort_order: number | null
}
