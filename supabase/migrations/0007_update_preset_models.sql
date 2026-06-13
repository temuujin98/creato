-- Migrate all presets still using deprecated Imagen models to gemini-2.5-flash-image.
-- Google is shutting down Imagen API (generateImages) on 2026-06-24.
-- The new Gemini adapter uses generateContent with gemini-2.5-flash-image.
UPDATE presets
SET primary_model = 'gemini-2.5-flash-image',
    primary_provider = 'gemini'
WHERE primary_model IN (
  'imagen-4.0-fast-generate-001',
  'imagen-3',
  'imagen-4.0-generate-001',
  'imagegeneration@006',
  'imagegeneration@005'
);

-- Also clear any fallback_model/fallback_provider referencing Imagen
UPDATE presets
SET fallback_model = NULL,
    fallback_provider = NULL
WHERE fallback_model IN (
  'imagen-4.0-fast-generate-001',
  'imagen-3',
  'imagen-4.0-generate-001',
  'imagegeneration@006',
  'imagegeneration@005'
);
