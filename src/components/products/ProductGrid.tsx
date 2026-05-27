import type { ComponentProps } from "react";
import type { Category } from "../../data/categories";
import type { Product } from "../../data/products";
import type { Language } from "../../i18n/translations";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  categories: Category[];
  emptyDescription: string;
  emptyTitle: string;
  language: Language;
  labels: ComponentProps<typeof ProductCard>["labels"];
  products: Product[];
};

export function ProductGrid({
  categories,
  emptyDescription,
  emptyTitle,
  language,
  labels,
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center">
        <p className="text-xl font-semibold text-white">{emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-md text-white/56">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          category={categories.find(
            (category) => category.slug === product.categorySlug,
          )}
          language={language}
          labels={labels}
          product={product}
        />
      ))}
    </div>
  );
}
