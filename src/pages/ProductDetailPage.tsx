import type { ReactNode } from "react";
import { ArrowLeft, Image, Settings2, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { categories } from "../data/categories";
import { getProductBySlug } from "../data/products";
import { useLanguage } from "../hooks/useLanguage";

export function ProductDetailPage() {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const product = slug ? getProductBySlug(slug) : undefined;
  const category = product
    ? categories.find((item) => item.slug === product.categorySlug)
    : undefined;

  if (!product) {
    return (
      <div className="min-h-screen bg-ink text-white">
        <Navbar />
        <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-3xl font-semibold">{t.productDetail.notFoundTitle}</p>
            <p className="mt-4 text-white/58">
              {t.productDetail.notFoundDescription}
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t.productDetail.back}
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.productDetail.back}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-3">
              <img
                src={product.imageUrl}
                alt={product.name[language]}
                className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase text-white/44">
                {category?.name[language] ?? product.categorySlug}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
                {product.name[language]}
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/64">
                {product.description[language]}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
                  label={t.productDetail.creditCost}
                  value={`${product.creditCost} ${
                    product.creditCost === 1
                      ? t.productsPage.credit
                      : t.productsPage.credits
                  }`}
                />
                <InfoCard
                  icon={<Image className="h-5 w-5" aria-hidden="true" />}
                  label={t.productDetail.imageInput}
                  value={
                    product.requiresImage
                      ? t.productDetail.requiresImage
                      : t.productDetail.noImageRequired
                  }
                />
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
                <p className="font-semibold">{t.productDetail.guide}</p>
                <p className="mt-3 leading-7 text-white/58">
                  {product.guide[language]}
                </p>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
                <p className="font-semibold">{t.productDetail.requirements}</p>
                <p className="mt-3 text-white/58">
                  {t.productDetail.imageRange}: {product.minImages}-
                  {product.maxImages}
                </p>
              </div>

              <Link
                to={`/generate/${product.slug}`}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-bone"
              >
                {t.productDetail.openGenerator}
              </Link>
            </div>
          </div>

          {product.optionPreview && product.optionPreview.length > 0 ? (
            <section className="mt-14">
              <h2 className="text-2xl font-semibold">{t.productDetail.options}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {product.optionPreview.map((option) => (
                  <article
                    key={option.label.en}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5"
                  >
                    <Settings2 className="mb-4 h-5 w-5 text-white/52" aria-hidden="true" />
                    <p className="font-semibold">{option.label[language]}</p>
                    <p className="mt-3 leading-7 text-white/56">
                      {option.description[language]}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-14">
            <h2 className="text-2xl font-semibold">
              {t.productDetail.outputExamples}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.outputExamples.map((example, index) => (
                <div
                  key={`${product.slug}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-2"
                >
                  <img
                    src={example}
                    alt={`${product.name[language]} example ${index + 1}`}
                    className="aspect-[4/3] w-full rounded-[1.1rem] object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="text-white/54">{icon}</div>
      <p className="mt-4 text-sm text-white/42">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
