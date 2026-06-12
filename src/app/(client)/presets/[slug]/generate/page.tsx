import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GenerateForm from '@/components/client/GenerateForm'
import type { PresetPublic, PresetFieldPublic } from '@/types/preset'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function GeneratePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [presetRes, walletRes] = await Promise.all([
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
    supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single(),
  ])

  if (presetRes.error || !presetRes.data) notFound()

  const preset = presetRes.data as unknown as PresetPublic
  const balance = walletRes.data?.balance ?? 0

  const { data: fieldsData } = await supabase
    .from('preset_fields_public')
    .select('id, field_key, label, input_type, required, placeholder, help_text, choices, sort_order')
    .eq('preset_id', preset.id)
    .order('sort_order', { ascending: true })

  const fields = (fieldsData ?? []) as unknown as PresetFieldPublic[]

  return (
    <GenerateForm
      preset={preset}
      fields={fields}
      walletBalance={balance}
    />
  )
}
