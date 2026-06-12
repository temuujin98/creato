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

  const [presetRes, fieldsRes, userRes] = await Promise.all([
    supabase
      .from('preset_public')
      .select('id, slug, name, short_description, long_description, credit_cost, category_name, is_featured, is_trending, is_new, example_image_urls, is_popular, sort_order')
      .eq('slug', slug)
      .single(),
    supabase
      .from('preset_fields_public')
      .select('id, field_key, label, field_type, is_required, placeholder_text, help_text, choices, sort_order')
      .eq('preset_slug', slug)
      .order('sort_order', { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (presetRes.error || !presetRes.data) {
    notFound()
  }

  const preset = presetRes.data as PresetPublic
  const fields = (fieldsRes.data ?? []) as PresetFieldPublic[]
  const isAuthenticated = !!userRes.data.user

  return <PresetDetail preset={preset} fields={fields} isAuthenticated={isAuthenticated} />
}
