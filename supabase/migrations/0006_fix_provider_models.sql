-- imagen-4.0-generate-001 returns 0 images on free-tier Google AI Studio keys (RAI/quota).
-- imagen-4.0-fast-generate-001 works reliably on the same keys.
-- gpt-image-1 replaces dall-e-3 (deprecated, returns 404 on newer OpenAI API versions).
UPDATE presets
SET primary_model    = 'imagen-4.0-fast-generate-001',
    fallback_provider = 'openai',
    fallback_model   = 'gpt-image-1'
WHERE primary_provider = 'gemini';
