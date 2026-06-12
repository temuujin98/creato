import { createClient } from '@/lib/supabase/server'
import MyImagesClient from '@/components/client/MyImagesClient'

type GenerationRow = {
  id: string
  status: string
  output_paths: string[]
  credit_cost: number
  created_at: string
  completed_at: string | null
  selected_size: string | null
  preset_id: string
}

export default async function MyImagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Explicit column list — server-only cols not granted, select(*) would fail by design
  const { data } = await supabase
    .from('generations')
    .select('id, status, output_paths, credit_cost, created_at, completed_at, selected_size, preset_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100)

  const generations = (data ?? []) as unknown as GenerationRow[]

  return <MyImagesClient generations={generations} />
}
