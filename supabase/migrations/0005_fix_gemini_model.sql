-- imagen-3.x is not available on the v1beta Gemini API endpoint.
-- Update all Gemini presets using deprecated model names to imagen-4.0-generate-001.
UPDATE presets
SET primary_model = 'imagen-4.0-generate-001'
WHERE primary_provider = 'gemini'
  AND primary_model IN ('imagen-3', 'imagen-3.0-generate-002', 'imagen-3.0-capability-001');
