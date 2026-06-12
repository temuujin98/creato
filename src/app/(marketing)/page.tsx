import type { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Header from '@/components/marketing/Header'
import Hero from '@/components/marketing/Hero'
import BenefitStrip from '@/components/marketing/BenefitStrip'
import FeaturedPresets from '@/components/marketing/FeaturedPresets'
import HowItWorks from '@/components/marketing/HowItWorks'
import Showcase from '@/components/marketing/Showcase'
import CreatorCommunity from '@/components/marketing/CreatorCommunity'
import UseCases from '@/components/marketing/UseCases'
import FAQ from '@/components/marketing/FAQ'
import FinalCta from '@/components/marketing/FinalCta'
import Footer from '@/components/marketing/Footer'
import ScrollReveal from '@/components/marketing/ScrollReveal'

export const metadata: Metadata = {
  title: 'Creato — Prompt-free AI зургийн студи | Монгол',
  description: 'Монгол бизнест зориулсан AI visual studio. Sale poster, product photo, social post зэргийг хэдхэн секундэд prompt бичихгүйгээр үүсгэ.',
  keywords: ['AI зураг', 'Монгол AI', 'sale poster', 'product photo', 'prompt-free', 'Creato'],
  openGraph: {
    title: 'Creato — Монгол AI Visual Studio',
    description: 'Prompt бичихгүйгээр мэргэжлийн зураг үүсгэ. Sale poster, меню, бүтээгдэхүүний зураг.',
    locale: 'mn_MN',
    type: 'website',
  },
}

import type { PresetPublicRow } from '@/components/marketing/FeaturedPresets'

async function getFeaturedPresets(): Promise<PresetPublicRow[]> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    const { data, error } = await supabase
      .from('preset_public')
      .select('id,slug,name,short_description,credit_cost,category_name,is_featured,is_trending,is_popular,is_new')
      .eq('is_active', true)
      .limit(8)
    if (error) return []
    return ((data ?? []) as PresetPublicRow[])
  } catch {
    return []
  }
}

export default async function HomePage() {
  const presets = await getFeaturedPresets()

  return (
    <>
      <Header />
      <main style={{ paddingTop: 66 }}>
        <Hero />
        <BenefitStrip />
        <ScrollReveal>
          <FeaturedPresets presets={presets} />
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <Showcase />
        </ScrollReveal>
        <ScrollReveal>
          <CreatorCommunity />
        </ScrollReveal>
        <ScrollReveal>
          <UseCases />
        </ScrollReveal>
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
        <ScrollReveal>
          <FinalCta />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  )
}
