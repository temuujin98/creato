import 'server-only'

export interface PresetServerData {
  base_prompt: string
  negative_prompt: string | null
  prompt_suffix: string | null
  quality_prompt: string | null
}

export interface FieldMapping {
  field_key: string
  prompt_mapping: string | null
  required: boolean
}

export interface BuiltPrompt {
  compiledPrompt: string
  negativePrompt: string | null
}

/**
 * Replaces [variable] placeholders in base_prompt using each field's
 * prompt_mapping value resolved from userInputs.
 *
 * prompt_mapping specifies the exact placeholder key to replace (e.g. "[subject]").
 * If prompt_mapping is null the field_key wrapped in brackets is used as fallback.
 *
 * Throws if any required field has no value in userInputs.
 */
export function buildPrompt(
  preset: PresetServerData,
  fields: FieldMapping[],
  userInputs: Record<string, string>,
): BuiltPrompt {
  // Validate required fields
  for (const field of fields) {
    if (field.required && !userInputs[field.field_key]?.trim()) {
      throw new Error(`required_field_missing:${field.field_key}`)
    }
  }

  let compiled = preset.base_prompt

  // Replace each field's placeholder
  for (const field of fields) {
    const value = userInputs[field.field_key]
    if (!value) continue

    // Use prompt_mapping if set, else fall back to [field_key]
    const placeholder = field.prompt_mapping ?? `[${field.field_key}]`
    compiled = compiled.split(placeholder).join(value)
  }

  // Append suffix and quality prompt if present
  if (preset.prompt_suffix?.trim()) {
    compiled = `${compiled}\n${preset.prompt_suffix.trim()}`
  }
  if (preset.quality_prompt?.trim()) {
    compiled = `${compiled}\n${preset.quality_prompt.trim()}`
  }

  return {
    compiledPrompt: compiled,
    negativePrompt: preset.negative_prompt ?? null,
  }
}
