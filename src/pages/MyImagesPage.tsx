import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CreationDetailModal } from "../components/creations/CreationDetailModal";
import { CreationCard } from "../components/my-creations/CreationCard";
import { CreationEmptyState } from "../components/my-creations/CreationEmptyState";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { products } from "../data/products";
import { useLanguage } from "../hooks/useLanguage";
import {
  getMyCreationPreviews,
  listReadyMyCreations,
  type MyCreation,
  type MyCreationOutputPreview,
} from "../lib/myCreations";

const PAGE_SIZE = 12;

type PreviewState = {
  failed?: boolean;
  preview?: MyCreationOutputPreview | null;
};

export function MyImagesPage() {
  const { language, t } = useLanguage();
  const [creations, setCreations] = useState<MyCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const [selectedCreation, setSelectedCreation] = useState<MyCreation | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const previewRequestedRef = useRef(new Set<string>());

  const productNameByDbId = useMemo(() => {
    return new Map(
      products
        .filter((product) => product.dbProductId)
        .map((product) => [product.dbProductId as string, product.name[language]]),
    );
  }, [language]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    listReadyMyCreations({ limit: 100 })
      .then((items) => {
        if (!isMounted) return;
        setCreations(items);
        setLoadError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setCreations([]);
        setLoadError(t.myImages.failedToLoadCreations);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [t.myImages.failedToLoadCreations]);

  const visibleCreations = useMemo(() => {
    return creations.slice(0, visibleCount);
  }, [creations, visibleCount]);

  // Sign preview URLs only for currently visible ready creations.
  // previewRequestedRef prevents duplicate signed URL calls when more items are revealed.
  useEffect(() => {
    let isMounted = true;

    async function loadPreviews() {
      for (const creation of visibleCreations) {
        if (previewRequestedRef.current.has(creation.id)) continue;
        previewRequestedRef.current.add(creation.id);

        try {
          const outputPreviews = await getMyCreationPreviews(creation.id);
          if (!isMounted) return;
          setPreviews((current) => ({
            ...current,
            [creation.id]: { preview: outputPreviews[0] ?? null },
          }));
        } catch {
          if (!isMounted) return;
          setPreviews((current) => ({
            ...current,
            [creation.id]: { failed: true, preview: null },
          }));
        }
      }
    }

    void loadPreviews();

    return () => {
      isMounted = false;
    };
  }, [visibleCreations]);

  const hasMore = visibleCount < creations.length;
  const allShown = !loading && !loadError && creations.length > 0 && !hasMore;

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-normal">
              {t.myImages.myCreations}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              {t.myImages.myCreationsSubtitle}
            </p>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950 p-5 text-white/60">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              {t.myImages.loadingCreations}
            </div>
          ) : null}

          {!loading && loadError ? (
            <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/[0.08] p-5 text-sm text-red-100/85">
              {loadError}
            </p>
          ) : null}

          {!loading && !loadError && creations.length === 0 ? (
            <div className="mt-10">
              <CreationEmptyState
                buttonLabel={t.myImages.startCreating}
                description={t.myImages.readyEmptyBody}
                title={t.myImages.readyEmptyTitle}
                to="/products"
              />
            </div>
          ) : null}

          {!loading && !loadError && visibleCreations.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCreations.map((creation) => (
                <CreationCard
                  key={creation.id}
                  creation={creation}
                  labels={{
                    createdAt: t.myImages.createdAt,
                    creditCost: t.myImages.creditCost,
                    credits: t.myImages.credits,
                    download: t.myImages.download,
                    presetFallback: t.myImages.preset,
                    previewUnavailable: t.myImages.previewUnavailable,
                    viewDetails: t.myImages.viewDetails,
                  }}
                  onOpenDetails={() => setSelectedCreation(creation)}
                  presetName={
                    productNameByDbId.get(creation.productId) ?? t.myImages.preset
                  }
                  preview={previews[creation.id]?.preview}
                  previewFailed={previews[creation.id]?.failed}
                  statusLabel={t.myImages.creationCompleted}
                />
              ))}
            </div>
          ) : null}

          {!loading && !loadError && creations.length > 0 ? (
            hasMore ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-primary/40 hover:bg-primary/15 hover:text-white"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  {t.myImages.loadMore}
                </button>
              </div>
            ) : allShown ? (
              <p className="mt-10 text-center text-sm text-white/40">
                {t.myImages.allCreationsShown}
              </p>
            ) : null
          ) : null}
        </section>
      </main>
      <Footer />
      {selectedCreation ? (
        <CreationDetailModal
          creation={selectedCreation}
          initialPreview={previews[selectedCreation.id]?.preview}
          labels={{
            close: t.myImages.close,
            createdDate: t.myImages.createdDate,
            credits: t.myImages.credits,
            creditsUsed: t.myImages.creditsUsed,
            detailTitle: t.myImages.detailTitle,
            download: t.myImages.download,
            emptyOutputs: t.myImages.emptyOutputs,
            failedRefundNotice: t.myImages.failedRefundNotice,
            failedTitle: t.myImages.failedTitle,
            loadingOutputs: t.myImages.loadingOutputs,
            outputLabel: t.myImages.outputLabel,
            outputsLoadFailed: t.myImages.outputsLoadFailed,
            previewUnavailable: t.myImages.previewUnavailable,
          }}
          onClose={() => setSelectedCreation(null)}
          presetName={
            productNameByDbId.get(selectedCreation.productId) ?? t.myImages.preset
          }
          statusLabel={t.myImages.creationCompleted}
        />
      ) : null}
    </div>
  );
}
