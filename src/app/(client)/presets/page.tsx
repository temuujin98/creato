import { createClient } from '@/lib/supabase/server'
import PresetsClient from '@/components/client/PresetsClient'
import type { PresetPublic } from '@/types/preset'

export default async function PresetsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('preset_public')
    .select('id, slug, name, short_description, long_description, credit_cost, category_name, is_featured, is_trending, is_popular, is_new, sort_order, example_image_urls')
    .order('sort_order', { ascending: true })

  const presets: PresetPublic[] = data ?? []

  return <PresetsClient presets={presets} />
}
