export type PresetPublic = {
  id: string
  slug: string
  name: string
  short_description: string | null
  full_description: string | null
  user_guide: string | null
  credit_cost: number
  category_name: string | null
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_new: boolean
  example_image_urls: string[] | null
  sort_order: number | null
  requires_image: boolean
  min_image_count: number
  max_image_count: number
  allowed_sizes: string[]
  output_count: number
  // SECURITY: base_prompt, negative_prompt, prompt_suffix, quality_prompt,
  // cleanup_prompt, prompt_mapping, internal_note, provider/model config,
  // estimated_cost are intentionally absent.
}

export type PresetFieldPublic = {
  id: string
  field_key: string
  label: string
  input_type: string      // actual column name in preset_fields_public
  required: boolean       // actual column name (not is_required)
  placeholder: string | null  // actual column name (not placeholder_text)
  help_text: string | null
  choices: unknown | null
  sort_order: number | null
}
