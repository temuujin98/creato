import type { Category } from "../../data/categories";
import type { Language } from "../../i18n/translations";

type CategoryFilterProps = {
  activeCategory: string;
  allLabel: string;
  categories: Category[];
  language: Language;
  onChange: (category: string) => void;
};

export function CategoryFilter({
  activeCategory,
  allLabel,
  categories,
  language,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          activeCategory === "all"
            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
            : "border-white/12 bg-white/[0.035] text-white/62 hover:border-white/24 hover:text-white"
        }`}
        onClick={() => onChange("all")}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category.slug}
          type="button"
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeCategory === category.slug
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
              : "border-white/12 bg-white/[0.035] text-white/62 hover:border-white/24 hover:text-white"
          }`}
          onClick={() => onChange(category.slug)}
        >
          {category.name[language]}
        </button>
      ))}
    </div>
  );
}
