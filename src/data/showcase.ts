import type { Language } from "../i18n/translations";

export type ShowcaseItem = {
  id: string;
  title: Record<Language, string>;
  alt: Record<Language, string>;
  image: string;
  rotation: string;
};

function svgImage(title: string, from: string, to: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="r" cx="35%" cy="20%" r="70%">
          <stop offset="0" stop-color="rgba(255,255,255,0.42)"/>
          <stop offset="1" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="900" height="900" fill="#050505"/>
      <rect x="44" y="44" width="812" height="812" rx="72" fill="url(#g)" opacity="0.68"/>
      <rect x="44" y="44" width="812" height="812" rx="72" fill="url(#r)"/>
      <circle cx="650" cy="245" r="150" fill="rgba(255,255,255,0.2)"/>
      <rect x="154" y="560" width="480" height="34" rx="17" fill="rgba(255,255,255,0.72)"/>
      <rect x="154" y="624" width="330" height="22" rx="11" fill="rgba(255,255,255,0.36)"/>
      <text x="154" y="506" fill="white" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const showcaseItems: ShowcaseItem[] = [
  {
    id: "product-campaign",
    title: { mn: "Campaign visual", en: "Campaign visual" },
    alt: { mn: "Барааны campaign visual", en: "Campaign visual" },
    image: svgImage("Campaign", "#111111", "#5f6f76"),
    rotation: "-rotate-3",
  },
  {
    id: "menu-visual",
    title: { mn: "Menu visual", en: "Menu visual" },
    alt: { mn: "Restaurant menu visual", en: "Restaurant menu visual" },
    image: svgImage("Menu", "#101010", "#45614f"),
    rotation: "rotate-2",
  },
  {
    id: "fashion-drop",
    title: { mn: "Fashion drop", en: "Fashion drop" },
    alt: { mn: "Fashion drop visual", en: "Fashion drop visual" },
    image: svgImage("Drop", "#090909", "#6d6473"),
    rotation: "rotate-3",
  },
  {
    id: "beauty-offer",
    title: { mn: "Beauty offer", en: "Beauty offer" },
    alt: { mn: "Beauty offer visual", en: "Beauty offer visual" },
    image: svgImage("Beauty", "#080808", "#765f65"),
    rotation: "-rotate-2",
  },
  {
    id: "social-post",
    title: { mn: "Social post", en: "Social post" },
    alt: { mn: "Social post visual", en: "Social post visual" },
    image: svgImage("Social", "#0b0b0b", "#556070"),
    rotation: "rotate-1",
  },
  {
    id: "promo-visual",
    title: { mn: "Promo visual", en: "Promo visual" },
    alt: { mn: "Promotional visual", en: "Promotional visual" },
    image: svgImage("Promo", "#0a0a0a", "#5e6b5c"),
    rotation: "-rotate-1",
  },
];
