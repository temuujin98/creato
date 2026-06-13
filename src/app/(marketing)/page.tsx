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

async function getVisibleSections(): Promise<Set<string>> {
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
      .from('homepage_sections')
      .select('section_key, is_visible')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return new Set<string>()
    return new Set(
      (data as Array<{ section_key: string; is_visible: boolean }>)
        .filter(s => s.is_visible)
        .map(s => s.section_key)
    )
  } catch {
    return new Set<string>()
  }
}

export default async function HomePage() {
  const [presets, visibleSections] = await Promise.all([
    getFeaturedPresets(),
    getVisibleSections(),
  ])

  // If fetch failed (empty set), default all sections to visible
  const allKeys = ['hero', 'benefit_strip', 'featured_presets', 'how_it_works', 'showcase', 'creator_community', 'business_use_cases', 'faq', 'final_cta']
  const vis = visibleSections.size > 0 ? visibleSections : new Set(allKeys)

  return (
    <>
      <Header />
      <main style={{ paddingTop: 66 }}>
        {vis.has('hero') && <Hero />}
        {vis.has('benefit_strip') && <BenefitStrip />}
        {vis.has('featured_presets') && (
          <ScrollReveal>
            <FeaturedPresets presets={presets} />
          </ScrollReveal>
        )}
        {vis.has('how_it_works') && (
          <ScrollReveal>
            <HowItWorks />
          </ScrollReveal>
        )}
        {vis.has('showcase') && (
          <ScrollReveal>
            <Showcase />
          </ScrollReveal>
        )}
        {vis.has('creator_community') && (
          <ScrollReveal>
            <CreatorCommunity />
          </ScrollReveal>
        )}
        {vis.has('business_use_cases') && (
          <ScrollReveal>
            <UseCases />
          </ScrollReveal>
        )}
        {vis.has('faq') && (
          <ScrollReveal>
            <FAQ />
          </ScrollReveal>
        )}
        {vis.has('final_cta') && (
          <ScrollReveal>
            <FinalCta />
          </ScrollReveal>
        )}
      </main>
      <Footer />
    </>
  )
}
