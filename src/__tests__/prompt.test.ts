import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../server/prompt'
import type { PresetServerData, FieldMapping } from '../server/prompt'

const basePreset: PresetServerData = {
  base_prompt: 'Create a [style] photo of [subject] with [color] background.',
  negative_prompt: 'blurry, low quality',
  prompt_suffix: 'High resolution.',
  quality_prompt: 'photorealistic, 8k',
}

const fields: FieldMapping[] = [
  { field_key: 'style',   prompt_mapping: '[style]',   required: true  },
  { field_key: 'subject', prompt_mapping: '[subject]', required: true  },
  { field_key: 'color',   prompt_mapping: '[color]',   required: false },
]

describe('buildPrompt', () => {
  it('replaces all variables from prompt_mapping', () => {
    const result = buildPrompt(basePreset, fields, {
      style: 'professional',
      subject: 'a business person',
      color: 'white',
    })
    expect(result.compiledPrompt).toContain('professional')
    expect(result.compiledPrompt).toContain('a business person')
    expect(result.compiledPrompt).toContain('white')
    expect(result.compiledPrompt).not.toContain('[style]')
    expect(result.compiledPrompt).not.toContain('[subject]')
    expect(result.compiledPrompt).not.toContain('[color]')
  })

  it('appends prompt_suffix and quality_prompt', () => {
    const result = buildPrompt(basePreset, fields, {
      style: 'x', subject: 'y', color: 'z',
    })
    expect(result.compiledPrompt).toContain('High resolution.')
    expect(result.compiledPrompt).toContain('photorealistic, 8k')
  })

  it('returns negative_prompt separately', () => {
    const result = buildPrompt(basePreset, fields, {
      style: 'x', subject: 'y',
    })
    expect(result.negativePrompt).toBe('blurry, low quality')
  })

  it('throws for missing required field', () => {
    expect(() =>
      buildPrompt(basePreset, fields, { style: 'professional' }) // subject missing
    ).toThrow('required_field_missing:subject')
  })

  it('skips replacement for optional empty field', () => {
    // color is optional — placeholder stays if not provided
    const result = buildPrompt(basePreset, fields, {
      style: 'professional',
      subject: 'a person',
      // color omitted
    })
    expect(result.compiledPrompt).toContain('[color]') // not replaced
    expect(result.compiledPrompt).not.toContain('[style]')
  })

  it('falls back to [field_key] when prompt_mapping is null', () => {
    const fieldsNoMapping: FieldMapping[] = [
      { field_key: 'style', prompt_mapping: null, required: true },
    ]
    const preset: PresetServerData = {
      base_prompt: 'Make a [style] image.',
      negative_prompt: null,
      prompt_suffix: null,
      quality_prompt: null,
    }
    const result = buildPrompt(preset, fieldsNoMapping, { style: 'cinematic' })
    expect(result.compiledPrompt).toContain('cinematic')
    expect(result.compiledPrompt).not.toContain('[style]')
  })

  it('handles multiple fields and multiple replacements in one prompt', () => {
    const preset: PresetServerData = {
      base_prompt: '[brand] sale: [discount]% off [product]. Contact: [brand].',
      negative_prompt: null,
      prompt_suffix: null,
      quality_prompt: null,
    }
    const multiFields: FieldMapping[] = [
      { field_key: 'brand',    prompt_mapping: '[brand]',    required: true },
      { field_key: 'discount', prompt_mapping: '[discount]', required: true },
      { field_key: 'product',  prompt_mapping: '[product]',  required: true },
    ]
    const result = buildPrompt(preset, multiFields, {
      brand: 'Creato', discount: '40', product: 'shoes',
    })
    expect(result.compiledPrompt).toBe(
      'Creato sale: 40% off shoes. Contact: Creato.'
    )
  })

  it('returns null negative prompt when preset has none', () => {
    const preset: PresetServerData = {
      base_prompt: 'test [x]',
      negative_prompt: null,
      prompt_suffix: null,
      quality_prompt: null,
    }
    const result = buildPrompt(
      preset,
      [{ field_key: 'x', prompt_mapping: '[x]', required: true }],
      { x: 'hello' }
    )
    expect(result.negativePrompt).toBeNull()
  })

  it('throws with field key in message for first missing required field', () => {
    const f: FieldMapping[] = [
      { field_key: 'name',  prompt_mapping: '[name]',  required: true },
      { field_key: 'color', prompt_mapping: '[color]', required: true },
    ]
    const p: PresetServerData = {
      base_prompt: '[name] [color]', negative_prompt: null,
      prompt_suffix: null, quality_prompt: null,
    }
    expect(() => buildPrompt(p, f, {})).toThrow('required_field_missing:name')
  })
})
