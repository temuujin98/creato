import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PresetDetail from '@/components/client/PresetDetail'
import type { PresetPublic, PresetFieldPublic } from '@/types/preset'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PresetDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch preset first to get its id for the fields query
  const [presetRes, userRes] = await Promise.all([
    supabase
      .from('preset_public')
      .select(
        'id, slug, name, short_description, full_description, user_guide, credit_cost,' +
        'category_name, is_featured, is_trending, is_new, is_popular, sort_order,' +
        'example_image_urls, requires_image, min_image_count, max_image_count,' +
        'allowed_sizes, output_count'
      )
      .eq('slug', slug)
      .single(),
    supabase.auth.getUser(),
  ])

  if (presetRes.error || !presetRes.data) {
    notFound()
  }

  const preset = presetRes.data as unknown as PresetPublic

  // Fields filtered by preset_id (preset_fields_public has no preset_slug column)
  const { data: fieldsData } = await supabase
    .from('preset_fields_public')
    .select('id, field_key, label, input_type, required, placeholder, help_text, choices, sort_order')
    .eq('preset_id', preset.id)
    .order('sort_order', { ascending: true })

  const fields = (fieldsData ?? []) as unknown as PresetFieldPublic[]
  const isAuthenticated = !!userRes.data.user

  return <PresetDetail preset={preset} fields={fields} isAuthenticated={isAuthenticated} />
}
