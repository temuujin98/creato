import { createClient } from '@/lib/supabase/server'
import PresetsClient from '@/components/client/PresetsClient'
import type { PresetPublic } from '@/types/preset'

export default async function PresetsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('preset_public')
    .select(
      'id, slug, name, short_description, full_description, user_guide, credit_cost,' +
      'category_name, is_featured, is_trending, is_popular, is_new, sort_order,' +
      'example_image_urls, requires_image, min_image_count, max_image_count,' +
      'allowed_sizes, output_count'
    )
    .order('sort_order', { ascending: true })

  const presets = (data ?? []) as unknown as PresetPublic[]

  return <PresetsClient presets={presets} />
}
