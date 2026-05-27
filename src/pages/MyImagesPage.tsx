import { EmptyGallery } from "../components/my-images/EmptyGallery";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

export function MyImagesPage() {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const displayName = profile?.full_name || user?.email;
  const filters = [
    t.myImages.all,
    t.myImages.productPhoto,
    t.myImages.socialPost,
    t.myImages.poster,
  ];

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-normal">
              {t.myImages.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              {t.myImages.description}
            </p>
            {displayName ? (
              <p className="mt-4 text-sm text-white/42">
                {t.myImages.signedInAs} {displayName}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                  index === 0
                    ? "border-white bg-white text-black"
                    : "border-white/12 bg-white/[0.035] text-white/58"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <EmptyGallery
              title={t.myImages.emptyTitle}
              notice={t.myImages.futureNotice}
              buttonLabel={t.myImages.exploreProducts}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
