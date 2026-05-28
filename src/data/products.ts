import type { Language } from "../i18n/translations";

export type ProductOptionPreview = {
  label: Record<Language, string>;
  description: Record<Language, string>;
};

export type ProductOptionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "color"
  | "number"
  | "aspect-ratio";

export type ProductOptionChoice = {
  label: Record<Language, string>;
  value: string;
};

export type ProductOptionSchema = {
  key: string;
  label: Record<Language, string>;
  type: ProductOptionType;
  required: boolean;
  placeholder?: Record<Language, string>;
  helpText?: Record<Language, string>;
  defaultValue?: string | number | boolean;
  choices?: ProductOptionChoice[];
};

export type ProductModelOption = {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  badge?: Record<Language, string>;
  creditCost: number;
  isDefault?: boolean;
};

export type Product = {
  id: string;
  dbProductId?: string;
  slug: string;
  categorySlug: string;
  name: Record<Language, string>;
  shortDescription: Record<Language, string>;
  description: Record<Language, string>;
  guide: Record<Language, string>;
  imageUrl: string;
  creditCost: number;
  requiresImage: boolean;
  minImages: number;
  maxImages: number;
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  outputExamples: string[];
  inputMode: "image" | "multi-image" | "text-only";
  aspectRatios?: string[];
  modelOptions?: ProductModelOption[];
  optionPreview?: ProductOptionPreview[];
  optionSchema?: ProductOptionSchema[];
};

function productImage(title: string, from: string, to: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 720">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="720" fill="#050505"/>
      <rect x="38" y="38" width="824" height="644" rx="56" fill="url(#g)" opacity="0.72"/>
      <circle cx="660" cy="205" r="136" fill="rgba(255,255,255,0.18)"/>
      <rect x="120" y="472" width="440" height="32" rx="16" fill="rgba(255,255,255,0.74)"/>
      <rect x="120" y="532" width="300" height="20" rx="10" fill="rgba(255,255,255,0.36)"/>
      <text x="120" y="420" fill="white" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const optionStyle: ProductOptionPreview = {
  label: { mn: "Visual style", en: "Visual style" },
  description: {
    mn: "Studio, luxury, minimal, seasonal зэрэг style сонголтын placeholder.",
    en: "Placeholder for studio, luxury, minimal, or seasonal style choices.",
  },
};

const optionFormat: ProductOptionPreview = {
  label: { mn: "Output format", en: "Output format" },
  description: {
    mn: "Square, story, poster зэрэг ирээдүйн format сонголтын placeholder.",
    en: "Placeholder for square, story, poster, and future format choices.",
  },
};

const aspectRatioOption: ProductOptionSchema = {
  key: "aspectRatio",
  label: { mn: "Хэмжээ", en: "Aspect ratio" },
  type: "aspect-ratio",
  required: true,
  defaultValue: "1:1",
  helpText: {
    mn: "Output зураг ямар format-тай байхыг сонгоно.",
    en: "Choose the output format for the generated visual.",
  },
  choices: [
    { label: { mn: "Square 1:1", en: "Square 1:1" }, value: "1:1" },
    { label: { mn: "Portrait 4:5", en: "Portrait 4:5" }, value: "4:5" },
    { label: { mn: "Story 9:16", en: "Story 9:16" }, value: "9:16" },
    { label: { mn: "Wide 16:9", en: "Wide 16:9" }, value: "16:9" },
  ],
};

const backgroundStyleOption: ProductOptionSchema = {
  key: "backgroundStyle",
  label: { mn: "Background style", en: "Background style" },
  type: "select",
  required: true,
  defaultValue: "minimal-studio",
  choices: [
    { label: { mn: "Minimal studio", en: "Minimal studio" }, value: "minimal-studio" },
    { label: { mn: "Luxury surface", en: "Luxury surface" }, value: "luxury-surface" },
    { label: { mn: "Dark cinematic", en: "Dark cinematic" }, value: "dark-cinematic" },
  ],
};

const productMoodOption: ProductOptionSchema = {
  key: "productMood",
  label: { mn: "Preset mood", en: "Preset mood" },
  type: "radio",
  required: true,
  defaultValue: "premium",
  choices: [
    { label: { mn: "Premium", en: "Premium" }, value: "premium" },
    { label: { mn: "Clean", en: "Clean" }, value: "clean" },
    { label: { mn: "Bold", en: "Bold" }, value: "bold" },
  ],
};

const saleTextOption: ProductOptionSchema = {
  key: "saleText",
  label: { mn: "Sale text", en: "Sale text" },
  type: "text",
  required: true,
  placeholder: { mn: "Жишээ: Big Sale", en: "Example: Big Sale" },
};

const discountTextOption: ProductOptionSchema = {
  key: "discountText",
  label: { mn: "Discount text", en: "Discount text" },
  type: "text",
  required: false,
  placeholder: { mn: "Жишээ: -30%", en: "Example: -30%" },
};

const foodNameOption: ProductOptionSchema = {
  key: "foodName",
  label: { mn: "Food name", en: "Food name" },
  type: "text",
  required: true,
  placeholder: { mn: "Жишээ: Үхрийн стейк", en: "Example: Beef steak" },
};

const moodSelectOption: ProductOptionSchema = {
  key: "mood",
  label: { mn: "Mood", en: "Mood" },
  type: "select",
  required: true,
  defaultValue: "fresh",
  choices: [
    { label: { mn: "Fresh", en: "Fresh" }, value: "fresh" },
    { label: { mn: "Warm", en: "Warm" }, value: "warm" },
    { label: { mn: "Premium", en: "Premium" }, value: "premium" },
  ],
};

const portraitStyleOption: ProductOptionSchema = {
  key: "portraitStyle",
  label: { mn: "Style", en: "Style" },
  type: "select",
  required: true,
  defaultValue: "editorial",
  choices: [
    { label: { mn: "Editorial", en: "Editorial" }, value: "editorial" },
    { label: { mn: "Cinematic", en: "Cinematic" }, value: "cinematic" },
    { label: { mn: "Minimal", en: "Minimal" }, value: "minimal" },
  ],
};

const notesOption: ProductOptionSchema = {
  key: "notes",
  label: { mn: "Notes", en: "Notes" },
  type: "textarea",
  required: false,
  placeholder: {
    mn: "Style эсвэл vibe-ийн богино тэмдэглэл...",
    en: "Short notes about the style or vibe...",
  },
};

const defaultModelOptions: ProductModelOption[] = [
  {
    id: "fast",
    name: { mn: "Fast", en: "Fast" },
    description: {
      mn: "Хурдан, энгийн зураг үүсгэхэд тохиромжтой.",
      en: "Good for fast, simple image generation.",
    },
    badge: { mn: "Санал болгох", en: "Recommended" },
    creditCost: 1,
    isDefault: true,
  },
  {
    id: "premium",
    name: { mn: "Premium", en: "Premium" },
    description: {
      mn: "Илүү чанартай, detail сайтай output-д тохиромжтой.",
      en: "Better for higher-quality, more detailed output.",
    },
    badge: { mn: "Илүү чанартай", en: "Higher quality" },
    creditCost: 2,
  },
];

export const products: Product[] = [
  {
    id: "clean-studio-product-shot",
    dbProductId: "22222222-2222-4222-8222-222222222201",
    slug: "clean-studio-product-shot",
    categorySlug: "product-photo",
    name: { mn: "Clean Studio Image Preset", en: "Clean Studio Image Preset" },
    shortDescription: {
      mn: "Барааны зургийг цэвэр studio look-той болгоно.",
      en: "Turn product photos into clean studio-style visuals.",
    },
    description: {
      mn: "E-commerce, catalog, marketplace-д ашиглахад тохиромжтой цэвэр background, premium lighting бүхий preset visual үүсгэнэ.",
      en: "A preset for creating clean-background, premium-lit visuals for e-commerce, catalogs, and marketplaces.",
    },
    guide: {
      mn: "Нэг барааны тод, чанартай зураг сонгоно. Дараагийн phase-д background/style option сонгох UI нэмэгдэнэ.",
      en: "Choose one clear input photo. A future phase will add background and style option UI.",
    },
    imageUrl: productImage("Studio", "#111111", "#5f6870"),
    creditCost: 1,
    requiresImage: true,
    minImages: 1,
    maxImages: 3,
    tags: ["studio", "catalog", "product"],
    isFeatured: true,
    isPopular: true,
    isNew: false,
    outputExamples: [
      productImage("Clean", "#0b0b0b", "#5b6570"),
      productImage("Catalog", "#111111", "#4f5f5c"),
    ],
    inputMode: "multi-image",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionStyle, optionFormat],
    optionSchema: [backgroundStyleOption, aspectRatioOption],
  },
  {
    id: "luxury-product-ad",
    dbProductId: "22222222-2222-4222-8222-222222222202",
    slug: "luxury-product-ad",
    categorySlug: "product-photo",
    name: { mn: "Luxury Image Ad", en: "Luxury Image Ad" },
    shortDescription: {
      mn: "Premium campaign mood бүхий барааны сурталчилгааны visual.",
      en: "Premium campaign visuals for item advertising.",
    },
    description: {
      mn: "Skincare, perfume, accessories, fashion item зэрэг premium бараанд зориулсан cinematic ad visual direction.",
      en: "A cinematic ad visual direction for premium skincare, perfume, accessories, and fashion items.",
    },
    guide: {
      mn: "Барааны 1-2 зураг бэлдэнэ. Ирээдүйд material, mood, background option нэмэгдэнэ.",
      en: "Prepare 1-2 input images. Future options can include material, mood, and background controls.",
    },
    imageUrl: productImage("Luxury", "#0a0a0a", "#71636f"),
    creditCost: 2,
    requiresImage: true,
    minImages: 1,
    maxImages: 4,
    tags: ["luxury", "ad", "campaign"],
    isFeatured: true,
    isPopular: false,
    isNew: true,
    outputExamples: [
      productImage("Ad", "#0b0b0b", "#77646d"),
      productImage("Premium", "#111111", "#5f6475"),
    ],
    inputMode: "multi-image",
    aspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionStyle],
    optionSchema: [backgroundStyleOption, aspectRatioOption, productMoodOption],
  },
  {
    id: "sale-poster",
    dbProductId: "22222222-2222-4222-8222-222222222203",
    slug: "sale-poster",
    categorySlug: "business-poster",
    name: { mn: "Sale Poster", en: "Sale Poster" },
    shortDescription: {
      mn: "Хямдрал, урамшууллын poster visual.",
      en: "Poster visuals for sales and promotions.",
    },
    description: {
      mn: "Богино хугацааны sale, offer, campaign announcement-д зориулсан poster layout direction.",
      en: "Poster layout direction for short-term sales, offers, and campaign announcements.",
    },
    guide: {
      mn: "Sale нэр, богино message, барааны зураг нэмэх flow дараагийн phase-д орно.",
      en: "A future phase will add inputs for sale title, short message, and optional item images.",
    },
    imageUrl: productImage("Sale", "#080808", "#685f55"),
    creditCost: 1,
    requiresImage: false,
    minImages: 0,
    maxImages: 3,
    tags: ["sale", "poster", "campaign"],
    isFeatured: false,
    isPopular: true,
    isNew: false,
    outputExamples: [productImage("Offer", "#111111", "#6a5f54")],
    inputMode: "text-only",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionFormat],
    optionSchema: [saleTextOption, discountTextOption, aspectRatioOption],
  },
  {
    id: "new-arrival-post",
    dbProductId: "22222222-2222-4222-8222-222222222204",
    slug: "new-arrival-post",
    categorySlug: "social-media-post",
    name: { mn: "New Arrival Post", en: "New Arrival Post" },
    shortDescription: {
      mn: "Шинэ collection, шинэ бараанд зориулсан social post.",
      en: "Social post visuals for new collections and new arrivals.",
    },
    description: {
      mn: "Instagram/Facebook feed-д тохирох minimal, premium new arrival visual template direction.",
      en: "A minimal, premium new-arrival visual template direction for Instagram and Facebook feeds.",
    },
    guide: {
      mn: "Барааны зураг болон богино headline option ирээдүйд нэмэгдэнэ.",
      en: "Input image and short headline options will be added in a later phase.",
    },
    imageUrl: productImage("Arrival", "#101010", "#5d6874"),
    creditCost: 1,
    requiresImage: true,
    minImages: 1,
    maxImages: 5,
    tags: ["social", "arrival", "post"],
    isFeatured: true,
    isPopular: false,
    isNew: true,
    outputExamples: [productImage("New", "#101010", "#536574")],
    inputMode: "multi-image",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionFormat],
    optionSchema: [aspectRatioOption],
  },
  {
    id: "food-highlight-poster",
    dbProductId: "22222222-2222-4222-8222-222222222205",
    slug: "food-highlight-poster",
    categorySlug: "food-menu",
    name: { mn: "Food Highlight Poster", en: "Food Highlight Poster" },
    shortDescription: {
      mn: "Онцлох хоол, set menu, seasonal offer poster.",
      en: "Poster visuals for featured dishes, sets, and seasonal offers.",
    },
    description: {
      mn: "Restaurant, cafe, delivery menu-д зориулсан хоолны visual poster direction.",
      en: "Food poster direction for restaurants, cafes, delivery menus, and seasonal offers.",
    },
    guide: {
      mn: "Хоолны зураг, нэр, богино offer text оруулах UI дараагийн phase-д нэмэгдэнэ.",
      en: "A later phase will add UI for dish photos, names, and short offer text.",
    },
    imageUrl: productImage("Food", "#0d0d0d", "#5d6c55"),
    creditCost: 1,
    requiresImage: true,
    minImages: 1,
    maxImages: 4,
    tags: ["food", "menu", "poster"],
    isFeatured: false,
    isPopular: true,
    isNew: false,
    outputExamples: [productImage("Menu", "#0b0b0b", "#526b5c")],
    inputMode: "multi-image",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionStyle, optionFormat],
    optionSchema: [foodNameOption, moodSelectOption, aspectRatioOption],
  },
  {
    id: "cosmetic-product-visual",
    dbProductId: "22222222-2222-4222-8222-222222222206",
    slug: "cosmetic-product-visual",
    categorySlug: "beauty-fashion",
    name: { mn: "Cosmetic Visual Preset", en: "Cosmetic Visual Preset" },
    shortDescription: {
      mn: "Skincare, makeup, beauty product-д зориулсан premium visual.",
      en: "Premium visuals for skincare, makeup, and beauty products.",
    },
    description: {
      mn: "Beauty brand-ийн social, ad, product detail visual-д тохирох цэвэр premium direction.",
      en: "A clean premium direction for beauty brand social, ad, and product detail visuals.",
    },
    guide: {
      mn: "Барааны зураг болон mood/style сонголт дараагийн UI phase-д нэмэгдэнэ.",
      en: "Input image and mood/style choices will be added in the next UI phase.",
    },
    imageUrl: productImage("Beauty", "#090909", "#74626b"),
    creditCost: 2,
    requiresImage: true,
    minImages: 1,
    maxImages: 4,
    tags: ["beauty", "cosmetic", "premium"],
    isFeatured: true,
    isPopular: true,
    isNew: false,
    outputExamples: [productImage("Glow", "#080808", "#7a6571")],
    inputMode: "multi-image",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionStyle],
    optionSchema: [backgroundStyleOption, productMoodOption, aspectRatioOption],
  },
  {
    id: "service-promotion-poster",
    dbProductId: "22222222-2222-4222-8222-222222222207",
    slug: "service-promotion-poster",
    categorySlug: "business-poster",
    name: { mn: "Service Promotion Poster", en: "Service Promotion Poster" },
    shortDescription: {
      mn: "Үйлчилгээ, booking, appointment-д зориулсан poster.",
      en: "Poster visuals for services, bookings, and appointments.",
    },
    description: {
      mn: "Salon, clinic, coaching, consulting зэрэг service business-д зориулсан promotional poster direction.",
      en: "Promotional poster direction for salons, clinics, coaching, consulting, and service businesses.",
    },
    guide: {
      mn: "Service нэр, үнэ, date, contact зэрэг option fields дараагийн phase-д орно.",
      en: "Future option fields can include service name, price, date, and contact details.",
    },
    imageUrl: productImage("Service", "#0c0c0c", "#596270"),
    creditCost: 1,
    requiresImage: false,
    minImages: 0,
    maxImages: 2,
    tags: ["service", "poster", "booking"],
    isFeatured: false,
    isPopular: false,
    isNew: false,
    outputExamples: [productImage("Promo", "#0c0c0c", "#60636d")],
    inputMode: "text-only",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionFormat],
    optionSchema: [saleTextOption, aspectRatioOption],
  },
  {
    id: "viral-ai-portrait-style",
    dbProductId: "22222222-2222-4222-8222-222222222208",
    slug: "viral-ai-portrait-style",
    categorySlug: "trend-templates",
    name: { mn: "Viral AI Portrait Style", en: "Viral AI Portrait Style" },
    shortDescription: {
      mn: "Trend portrait visual style турших preset.",
      en: "A preset for exploring trend portrait visual styles.",
    },
    description: {
      mn: "Social trend, campaign avatar, profile visual зэрэг portrait-focused creative output-д зориулсан direction.",
      en: "A direction for portrait-focused creative outputs such as social trends, campaign avatars, and profile visuals.",
    },
    guide: {
      mn: "1 portrait зураг хэрэгтэй. Style сонголтууд дараагийн generate UI phase-д placeholder байдлаар орно.",
      en: "Requires one portrait image. Style choices will appear as placeholders in the next generate UI phase.",
    },
    imageUrl: productImage("Portrait", "#0a0a0a", "#667078"),
    creditCost: 2,
    requiresImage: true,
    minImages: 1,
    maxImages: 1,
    tags: ["trend", "portrait", "ai"],
    isFeatured: false,
    isPopular: true,
    isNew: true,
    outputExamples: [productImage("Viral", "#0a0a0a", "#626f7a")],
    inputMode: "image",
    aspectRatios: ["1:1", "4:5", "9:16"],
    modelOptions: defaultModelOptions,
    optionPreview: [optionStyle],
    optionSchema: [portraitStyleOption, aspectRatioOption, notesOption],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
