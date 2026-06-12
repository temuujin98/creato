-- seed.sql — MVP categories, credit packages, homepage sections, 1 demo preset
-- Run in dev / first deploy. Idempotent via on conflict.

insert into public.categories (name, slug, sort_order) values
  ('Product Photo','product-photo',1),
  ('Social Media Post','social-media-post',2),
  ('Food & Menu','food-menu',3),
  ('Beauty & Fashion','beauty-fashion',4),
  ('Business Poster','business-poster',5),
  ('Trend Templates','trend-templates',6)
on conflict (slug) do nothing;

insert into public.credit_packages (name, credits, price_mnt, sort_order) values
  ('Starter', 10, 9900, 1),
  ('Basic', 25, 23900, 2),
  ('Pro', 50, 44900, 3),
  ('Business', 100, 84900, 4)
on conflict do nothing;

insert into public.homepage_sections (section_key, section_type, title, sort_order) values
  ('hero','hero','Prompt бичихгүй. Visual бэлэн.',1),
  ('benefit_strip','benefit_strip',null,2),
  ('featured_presets','featured_presets','Хамгийн их ашиглагддаг presets',3),
  ('how_it_works','how_it_works','4 алхам. Prompt байхгүй.',4),
  ('showcase','showcase','Creato-р бүтээсэн visual-ууд',5),
  ('creator_community','creator_community','Өөрийн preset-ээ үүсгээд бусдад ашиглуул',6),
  ('business_use_cases','business_use_cases','Таны бизнест яг хэрэгтэй',7),
  ('faq','faq','Түгээмэл асуулт',8),
  ('final_cta','final_cta','Prompt бичихгүйгээр эхний visual-аа бүтээ.',9)
on conflict (section_key) do nothing;

-- Demo preset: Sale poster (draft until admin reviews → set active)
with cat as (select id from public.categories where slug = 'business-poster'),
ins as (
  insert into public.presets (
    slug, category_id, name, short_description, full_description, user_guide,
    credit_cost, status, is_featured, requires_image,
    allowed_sizes, output_count,
    base_prompt, negative_prompt, quality_prompt,
    primary_provider, primary_model, fallback_provider, fallback_model,
    quality_preset, retry_limit
  )
  select
    'sale-poster', cat.id, 'Sale постер',
    'Хямдрал, урамшууллын зарлал',
    'Бүтээгдэхүүн, брэндийнхээ хямдралын постерыг хэдхэн секундэд үүсгэ.',
    'Бүтээгдэхүүнийхээ нэр, хямдралын хувь, брэнд өнгөө оруулаад Generate дарна.',
    1, 'active', true, false,
    '{1:1,4:5,9:16}', 1,
    'Create a premium sale poster for [product_name]. Discount: [discount_text]. Brand color: [brand_color]. Bold modern Mongolian e-commerce style, high contrast, clean composition.',
    'blurry, low quality, distorted text, watermark',
    'high detail, professional studio lighting, sharp typography',
    'gemini', 'imagen-3', 'openai', 'dall-e-3',
    'standard', 1
  from cat
  on conflict (slug) do nothing
  returning id
)
insert into public.preset_fields (preset_id, field_key, label, input_type, required, placeholder, prompt_mapping, sort_order)
select id, x.field_key, x.label, x.input_type, x.required, x.placeholder, x.prompt_mapping, x.sort_order
from ins, (values
  ('product_name','Бүтээгдэхүүний нэр','text', true,  'ж: Lhamour тос', '[product_name]', 1),
  ('discount_text','Хямдралын текст','text', true,  'ж: -40%',        '[discount_text]', 2),
  ('brand_color','Брэнд өнгө','color', false, null,             '[brand_color]', 3)
) as x(field_key,label,input_type,required,placeholder,prompt_mapping,sort_order)
on conflict (preset_id, field_key) do nothing;

-- Product photo preset: requires_image=true, 1 input image
with cat2 as (select id from public.categories where slug = 'product-photo'),
ins2 as (
  insert into public.presets (
    slug, category_id, name, short_description, full_description, user_guide,
    credit_cost, status, is_featured, is_new,
    requires_image, min_image_count, max_image_count,
    allowed_file_types, max_file_size_mb,
    upload_guide_text,
    allowed_sizes, output_count,
    base_prompt, negative_prompt, quality_prompt,
    primary_provider, primary_model, fallback_provider, fallback_model,
    quality_preset, retry_limit
  )
  select
    'product-photo', cat2.id, 'Бүтээгдэхүүний зураг',
    'Бүтээгдэхүүнийхээ зургийг studio background дээр авч',
    'Утасны камераар авсан бүтээгдэхүүний зургийг мэргэжлийн studio фото болгож хувиргана.',
    'Цагаан эсвэл цэвэр дэвсгэр дээр авсан зураг хамгийн сайн үр дүн өгнө. Зурган дээр гар, хүн байхгүй байвал илүү.',
    1, 'active', false, true,
    true, 1, 1,
    '{jpg,jpeg,png,webp}', 10,
    'Оруулж буй бүтээгдэхүүний зургийг цэвэр studio арын дэвсгэр дээр байрлуул.',
    '{1:1,4:5}', 1,
    'Professional product photography of [product_name] on a [background_style] studio background. Clean, high-end commercial style, perfect lighting, sharp focus, no shadows.',
    'blurry, cluttered, person, hand, watermark, text overlay, dark background',
    'professional studio lighting, 8k resolution, commercial photography, pristine clean background',
    'gemini', 'imagen-4.0-fast-generate-001', 'openai', 'gpt-image-1',
    'standard', 1
  from cat2
  on conflict (slug) do nothing
  returning id
)
insert into public.preset_fields (preset_id, field_key, label, input_type, required, placeholder, help_text, prompt_mapping, sort_order)
select id, x.field_key, x.label, x.input_type, x.required, x.placeholder, x.help_text, x.prompt_mapping, x.sort_order
from ins2, (values
  ('product_name', 'Бүтээгдэхүүний нэр', 'text',   true,  'ж: Lhamour арьс тэжээгч тос', 'Бүтээгдэхүүний яг нэрийг оруулна уу', '[product_name]',   1),
  ('background_style', 'Арын дэвсгэр',  'select', false, null, null, '[background_style]', 2)
) as x(field_key,label,input_type,required,placeholder,help_text,prompt_mapping,sort_order)
on conflict (preset_id, field_key) do nothing;

-- background_style choices
update public.preset_fields
set choices = '["цагаан","градиент","нүдний"]'::jsonb
where field_key = 'background_style'
  and preset_id = (select id from public.presets where slug = 'product-photo');
