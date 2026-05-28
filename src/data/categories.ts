import type { Language } from "../i18n/translations";

export type Category = {
  id: string;
  slug: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  iconKey: "image" | "share" | "utensils" | "sparkles" | "megaphone" | "trending";
  sortOrder: number;
};

export const categories: Category[] = [
  {
    id: "product-photo",
    slug: "product-photo",
    name: { mn: "Catalog Photo", en: "Catalog Photo" },
    description: {
      mn: "Барааны зургийг studio, catalog, campaign хэлбэрт бэлдэх preset-үүд.",
      en: "Presets for studio, catalog, and campaign-ready item visuals.",
    },
    iconKey: "image",
    sortOrder: 1,
  },
  {
    id: "social-media-post",
    slug: "social-media-post",
    name: { mn: "Social Media Post", en: "Social Media Post" },
    description: {
      mn: "Instagram, Facebook, story, announcement-д зориулсан visual preset-үүд.",
      en: "Visual presets for Instagram, Facebook, stories, and announcements.",
    },
    iconKey: "share",
    sortOrder: 2,
  },
  {
    id: "food-menu",
    slug: "food-menu",
    name: { mn: "Food & Menu", en: "Food & Menu" },
    description: {
      mn: "Хоол, ундаа, menu, seasonal offer visual-д зориулсан preset-үүд.",
      en: "Presets for food, drinks, menus, and seasonal offer visuals.",
    },
    iconKey: "utensils",
    sortOrder: 3,
  },
  {
    id: "beauty-fashion",
    slug: "beauty-fashion",
    name: { mn: "Beauty & Fashion", en: "Beauty & Fashion" },
    description: {
      mn: "Beauty, skincare, fashion drop, service promo visual preset-үүд.",
      en: "Visual presets for beauty, skincare, fashion drops, and service promos.",
    },
    iconKey: "sparkles",
    sortOrder: 4,
  },
  {
    id: "business-poster",
    slug: "business-poster",
    name: { mn: "Business Poster", en: "Business Poster" },
    description: {
      mn: "Sale, service, launch, event poster-д зориулсан preset-үүд.",
      en: "Presets for sales, services, launches, and event posters.",
    },
    iconKey: "megaphone",
    sortOrder: 5,
  },
  {
    id: "trend-templates",
    slug: "trend-templates",
    name: { mn: "Trend Templates", en: "Trend Templates" },
    description: {
      mn: "Тренд visual style, AI portrait, campaign mood турших preset-үүд.",
      en: "Presets for trying trend visuals, AI portraits, and campaign moods.",
    },
    iconKey: "trending",
    sortOrder: 6,
  },
];
