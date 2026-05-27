import { Image, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../../data/categories";
import type { Product } from "../../data/products";
import type { Language } from "../../i18n/translations";

type ProductCardProps = {
  category?: Category;
  language: Language;
  product: Product;
  labels: {
    credit: string;
    credits: string;
    details: string;
    featured: string;
    imageNotRequired: string;
    imageRequired: string;
    new: string;
    popular: string;
  };
};

export function ProductCard({
  category,
  language,
  labels,
  product,
}: ProductCardProps) {
  const creditLabel = product.creditCost === 1 ? labels.credit : labels.credits;
  const badges = [
    product.isFeatured ? labels.featured : null,
    product.isPopular ? labels.popular : null,
    product.isNew ? labels.new : null,
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/22 hover:bg-white/[0.055]">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[1.35rem] bg-white/[0.04]">
          <img
            src={product.imageUrl}
            alt={product.name[language]}
            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.025]"
          />
          {badges.length > 0 ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/14 bg-black/62 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-3">
          <p className="text-xs font-semibold uppercase text-white/42">
            {category?.name[language] ?? product.categorySlug}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {product.name[language]}
          </h2>
          <p className="mt-3 min-h-14 text-sm leading-6 text-white/58">
            {product.shortDescription[language]}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/54">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {product.creditCost} {creditLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5">
              <Image className="h-3.5 w-3.5" aria-hidden="true" />
              {product.requiresImage
                ? labels.imageRequired
                : labels.imageNotRequired}
            </span>
          </div>

          <div className="mt-6 inline-flex text-sm font-semibold text-white transition group-hover:translate-x-1">
            {labels.details} -&gt;
          </div>
        </div>
      </Link>
    </article>
  );
}
