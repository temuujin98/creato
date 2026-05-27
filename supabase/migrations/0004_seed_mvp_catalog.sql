-- creato Phase 10.1 MVP public catalog seed.
-- Safe to run more than once. This file seeds public categories/products/options only.
-- It intentionally does not seed prompt_versions, model_configs, provider credentials, or admin-only data.

insert into public.categories (id, slug, status, sort_order)
values
  ('11111111-1111-4111-8111-111111111111', 'product-photo', 'active', 10),
  ('11111111-1111-4111-8111-111111111112', 'social-media-post', 'active', 20),
  ('11111111-1111-4111-8111-111111111113', 'food-menu', 'active', 30),
  ('11111111-1111-4111-8111-111111111114', 'beauty-fashion', 'active', 40),
  ('11111111-1111-4111-8111-111111111115', 'business-poster', 'active', 50),
  ('11111111-1111-4111-8111-111111111116', 'trend-templates', 'active', 60)
on conflict (slug) do update
set status = excluded.status,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.category_translations (category_id, locale, name, description)
values
  ('11111111-1111-4111-8111-111111111111', 'mn', 'Product Photo', 'Барааны зураг болон e-commerce визуал.'),
  ('11111111-1111-4111-8111-111111111111', 'en', 'Product Photo', 'Product photography and e-commerce visuals.'),
  ('11111111-1111-4111-8111-111111111112', 'mn', 'Social Media Post', 'Social post болон campaign content.'),
  ('11111111-1111-4111-8111-111111111112', 'en', 'Social Media Post', 'Social posts and campaign content.'),
  ('11111111-1111-4111-8111-111111111113', 'mn', 'Food & Menu', 'Ресторан, кафе, menu визуал.'),
  ('11111111-1111-4111-8111-111111111113', 'en', 'Food & Menu', 'Restaurant, cafe, and menu visuals.'),
  ('11111111-1111-4111-8111-111111111114', 'mn', 'Beauty & Fashion', 'Beauty, fashion, cosmetic product визуал.'),
  ('11111111-1111-4111-8111-111111111114', 'en', 'Beauty & Fashion', 'Beauty, fashion, and cosmetic product visuals.'),
  ('11111111-1111-4111-8111-111111111115', 'mn', 'Business Poster', 'Sale, service, promotion poster.'),
  ('11111111-1111-4111-8111-111111111115', 'en', 'Business Poster', 'Sale, service, and promotion posters.'),
  ('11111111-1111-4111-8111-111111111116', 'mn', 'Trend Templates', 'Trend болон experimental visual template.'),
  ('11111111-1111-4111-8111-111111111116', 'en', 'Trend Templates', 'Trend and experimental visual templates.')
on conflict (category_id, locale) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

insert into public.products (
  id,
  category_id,
  slug,
  thumbnail_url,
  credit_cost,
  status,
  sort_order,
  is_featured,
  is_trending,
  is_popular,
  is_new,
  requires_image,
  min_images,
  max_images,
  enable_options
)
values
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111111', 'clean-studio-product-shot', null, 1, 'active', 10, true, false, true, false, true, 1, 3, true),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111111', 'luxury-product-ad', null, 2, 'active', 20, true, false, false, true, true, 1, 4, true),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111115', 'sale-poster', null, 1, 'active', 30, false, false, true, false, false, 0, 3, true),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111112', 'new-arrival-post', null, 1, 'active', 40, true, false, false, true, true, 1, 5, true),
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111113', 'food-highlight-poster', null, 1, 'active', 50, false, false, true, false, true, 1, 4, true),
  ('22222222-2222-4222-8222-222222222206', '11111111-1111-4111-8111-111111111114', 'cosmetic-product-visual', null, 2, 'active', 60, true, false, true, false, true, 1, 4, true),
  ('22222222-2222-4222-8222-222222222207', '11111111-1111-4111-8111-111111111115', 'service-promotion-poster', null, 1, 'active', 70, false, false, false, false, false, 0, 2, true),
  ('22222222-2222-4222-8222-222222222208', '11111111-1111-4111-8111-111111111116', 'viral-ai-portrait-style', null, 2, 'active', 80, false, true, true, true, true, 1, 1, true)
on conflict (slug) do update
set category_id = excluded.category_id,
    thumbnail_url = excluded.thumbnail_url,
    credit_cost = excluded.credit_cost,
    status = excluded.status,
    sort_order = excluded.sort_order,
    is_featured = excluded.is_featured,
    is_trending = excluded.is_trending,
    is_popular = excluded.is_popular,
    is_new = excluded.is_new,
    requires_image = excluded.requires_image,
    min_images = excluded.min_images,
    max_images = excluded.max_images,
    enable_options = excluded.enable_options,
    updated_at = now();

insert into public.product_translations (product_id, locale, name, short_description, description, guide)
values
  ('22222222-2222-4222-8222-222222222201', 'mn', 'Clean Studio Product Shot', 'Барааны зургийг цэвэр studio look-той болгоно.', 'E-commerce, catalog, marketplace-д ашиглахад тохиромжтой цэвэр background, premium lighting бүхий product visual.', 'Нэг барааны тод, чанартай зураг сонгоно.'),
  ('22222222-2222-4222-8222-222222222201', 'en', 'Clean Studio Product Shot', 'Turn product photos into clean studio-style visuals.', 'Create clean-background, premium-lit visuals for e-commerce, catalogs, and marketplaces.', 'Choose one clear product photo.'),
  ('22222222-2222-4222-8222-222222222202', 'mn', 'Luxury Product Ad', 'Premium campaign mood бүхий барааны сурталчилгааны visual.', 'Premium бараанд зориулсан cinematic ad visual direction.', 'Барааны 1-2 зураг бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222202', 'en', 'Luxury Product Ad', 'Premium campaign visuals for product advertising.', 'A cinematic ad visual direction for premium product advertising.', 'Prepare 1-2 product images.'),
  ('22222222-2222-4222-8222-222222222203', 'mn', 'Sale Poster', 'Хямдрал, урамшууллын poster visual.', 'Sale, offer, campaign announcement-д зориулсан poster layout direction.', 'Sale нэр, богино message, барааны зураг бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222203', 'en', 'Sale Poster', 'Poster visuals for sales and promotions.', 'Poster layout direction for sales, offers, and campaign announcements.', 'Prepare sale title, short message, and optional product images.'),
  ('22222222-2222-4222-8222-222222222204', 'mn', 'New Arrival Post', 'Шинэ collection, шинэ бараанд зориулсан social post.', 'Instagram/Facebook feed-д тохирох minimal, premium new arrival visual.', 'Барааны зураг болон богино headline бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222204', 'en', 'New Arrival Post', 'Social post visuals for new collections and products.', 'A minimal, premium new-arrival visual for social feeds.', 'Prepare product images and a short headline.'),
  ('22222222-2222-4222-8222-222222222205', 'mn', 'Food Highlight Poster', 'Онцлох хоол, set menu, seasonal offer poster.', 'Restaurant, cafe, delivery menu-д зориулсан хоолны visual poster.', 'Хоолны зураг, нэр, offer text бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222205', 'en', 'Food Highlight Poster', 'Poster visuals for featured dishes, sets, and offers.', 'Food poster direction for restaurants, cafes, and delivery menus.', 'Prepare dish photos, names, and offer text.'),
  ('22222222-2222-4222-8222-222222222206', 'mn', 'Cosmetic Product Visual', 'Skincare, makeup, beauty product-д зориулсан premium visual.', 'Beauty brand-ийн social, ad, product detail visual-д тохирох premium direction.', 'Барааны зураг болон mood/style сонголт бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222206', 'en', 'Cosmetic Product Visual', 'Premium visuals for skincare, makeup, and beauty products.', 'A clean premium direction for beauty brand social, ad, and product detail visuals.', 'Prepare product images and mood/style choices.'),
  ('22222222-2222-4222-8222-222222222207', 'mn', 'Service Promotion Poster', 'Үйлчилгээ, booking, appointment-д зориулсан poster.', 'Service business-д зориулсан promotional poster direction.', 'Service нэр, үнэ, date, contact зэрэг мэдээлэл бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222207', 'en', 'Service Promotion Poster', 'Poster visuals for services, bookings, and appointments.', 'Promotional poster direction for service businesses.', 'Prepare service name, price, date, and contact details.'),
  ('22222222-2222-4222-8222-222222222208', 'mn', 'Viral AI Portrait Style', 'Trend portrait visual style турших product.', 'Portrait-focused creative outputs such as social trends and campaign avatars.', 'Нэг portrait зураг болон style сонголт бэлдэнэ.'),
  ('22222222-2222-4222-8222-222222222208', 'en', 'Viral AI Portrait Style', 'A product for exploring trend portrait visual styles.', 'Portrait-focused creative outputs such as social trends, campaign avatars, and profile visuals.', 'Prepare one portrait image and style choices.')
on conflict (product_id, locale) do update
set name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    guide = excluded.guide,
    updated_at = now();

insert into public.product_options (id, product_id, key, input_type, required, placeholder, help_text, default_value, sort_order, is_active)
values
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201', 'backgroundStyle', 'select', true, null, null, 'minimal-studio', 10, true),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 20, true),
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222202', 'backgroundStyle', 'select', true, null, null, 'minimal-studio', 10, true),
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222202', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 20, true),
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222202', 'productMood', 'radio', true, null, null, 'premium', 30, true),
  ('33333333-3333-4333-8333-333333333306', '22222222-2222-4222-8222-222222222203', 'saleText', 'text', true, 'Example: Big Sale', null, null, 10, true),
  ('33333333-3333-4333-8333-333333333307', '22222222-2222-4222-8222-222222222203', 'discountText', 'text', false, 'Example: -30%', null, null, 20, true),
  ('33333333-3333-4333-8333-333333333308', '22222222-2222-4222-8222-222222222203', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 30, true),
  ('33333333-3333-4333-8333-333333333309', '22222222-2222-4222-8222-222222222204', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 10, true),
  ('33333333-3333-4333-8333-333333333310', '22222222-2222-4222-8222-222222222205', 'foodName', 'text', true, 'Example: Beef steak', null, null, 10, true),
  ('33333333-3333-4333-8333-333333333311', '22222222-2222-4222-8222-222222222205', 'mood', 'select', true, null, null, 'fresh', 20, true),
  ('33333333-3333-4333-8333-333333333312', '22222222-2222-4222-8222-222222222205', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 30, true),
  ('33333333-3333-4333-8333-333333333313', '22222222-2222-4222-8222-222222222206', 'backgroundStyle', 'select', true, null, null, 'minimal-studio', 10, true),
  ('33333333-3333-4333-8333-333333333314', '22222222-2222-4222-8222-222222222206', 'productMood', 'radio', true, null, null, 'premium', 20, true),
  ('33333333-3333-4333-8333-333333333315', '22222222-2222-4222-8222-222222222206', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 30, true),
  ('33333333-3333-4333-8333-333333333316', '22222222-2222-4222-8222-222222222207', 'saleText', 'text', true, 'Example: New service offer', null, null, 10, true),
  ('33333333-3333-4333-8333-333333333317', '22222222-2222-4222-8222-222222222207', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 20, true),
  ('33333333-3333-4333-8333-333333333318', '22222222-2222-4222-8222-222222222208', 'portraitStyle', 'select', true, null, null, 'editorial', 10, true),
  ('33333333-3333-4333-8333-333333333319', '22222222-2222-4222-8222-222222222208', 'aspectRatio', 'aspect-ratio', true, null, 'Choose output format.', '1:1', 20, true),
  ('33333333-3333-4333-8333-333333333320', '22222222-2222-4222-8222-222222222208', 'notes', 'textarea', false, 'Short notes about the style or vibe...', null, null, 30, true)
on conflict (product_id, key) do update
set input_type = excluded.input_type,
    required = excluded.required,
    placeholder = excluded.placeholder,
    help_text = excluded.help_text,
    default_value = excluded.default_value,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.option_translations (option_id, locale, label, placeholder, help_text)
select id, 'en', key, placeholder, help_text from public.product_options
where product_id in (select id from public.products where slug in (
  'clean-studio-product-shot', 'luxury-product-ad', 'sale-poster', 'new-arrival-post',
  'food-highlight-poster', 'cosmetic-product-visual', 'service-promotion-poster', 'viral-ai-portrait-style'
))
on conflict (option_id, locale) do update
set label = excluded.label,
    placeholder = excluded.placeholder,
    help_text = excluded.help_text,
    updated_at = now();

insert into public.option_translations (option_id, locale, label, placeholder, help_text)
select id, 'mn', key, placeholder, help_text from public.product_options
where product_id in (select id from public.products where slug in (
  'clean-studio-product-shot', 'luxury-product-ad', 'sale-poster', 'new-arrival-post',
  'food-highlight-poster', 'cosmetic-product-visual', 'service-promotion-poster', 'viral-ai-portrait-style'
))
on conflict (option_id, locale) do update
set label = excluded.label,
    placeholder = excluded.placeholder,
    help_text = excluded.help_text,
    updated_at = now();

insert into public.product_option_choices (option_id, label, value, sort_order)
select po.id, choice_seed.label, choice_seed.value, choice_seed.sort_order
from (
  values
    ('backgroundStyle', 'Minimal studio', 'minimal-studio', 10),
    ('backgroundStyle', 'Luxury surface', 'luxury-surface', 20),
    ('backgroundStyle', 'Dark cinematic', 'dark-cinematic', 30),
    ('productMood', 'Premium', 'premium', 10),
    ('productMood', 'Clean', 'clean', 20),
    ('productMood', 'Bold', 'bold', 30),
    ('mood', 'Fresh', 'fresh', 10),
    ('mood', 'Warm', 'warm', 20),
    ('mood', 'Premium', 'premium', 30),
    ('portraitStyle', 'Editorial', 'editorial', 10),
    ('portraitStyle', 'Cinematic', 'cinematic', 20),
    ('portraitStyle', 'Minimal', 'minimal', 30),
    ('aspectRatio', 'Square 1:1', '1:1', 10),
    ('aspectRatio', 'Portrait 4:5', '4:5', 20),
    ('aspectRatio', 'Story 9:16', '9:16', 30),
    ('aspectRatio', 'Wide 16:9', '16:9', 40)
) as choice_seed(option_key, label, value, sort_order)
join public.product_options po on po.key = choice_seed.option_key
join public.products p on p.id = po.product_id
where p.slug in (
  'clean-studio-product-shot', 'luxury-product-ad', 'sale-poster', 'new-arrival-post',
  'food-highlight-poster', 'cosmetic-product-visual', 'service-promotion-poster', 'viral-ai-portrait-style'
)
on conflict (option_id, value) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    updated_at = now();

-- Validation helper:
-- select id, slug from public.products order by sort_order;
