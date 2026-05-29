import { CalendarDays, ImageOff, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../../data/products";
import { useLanguage } from "../../hooks/useLanguage";
import {
  getMyCreationPreviews,
  listRecentMyCreations,
  type MyCreation,
  type MyCreationOutputPreview,
  type MyCreationStatus,
} from "../../lib/myCreations";
import { CreationStatusBadge } from "../my-creations/CreationStatusBadge";

type PreviewState = {
  failed?: boolean;
  preview?: MyCreationOutputPreview | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isComplete(status: MyCreationStatus) {
  return status === "completed" || status === "credit_spent";
}

export function RecentCreationsSection() {
  const { language, t } = useLanguage();
  const [creations, setCreations] = useState<MyCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const previewRequestedRef = useRef(new Set<string>());

  const productNameByDbId = useMemo(() => {
    return new Map(
      products
        .filter((p) => p.dbProductId)
        .map((p) => [p.dbProductId as string, p.name[language]]),
    );
  }, [language]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    listRecentMyCreations(6)
      .then((items) => {
        if (!isMounted) return;
        setCreations(items);
        setLoadError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError(t.dashboard.recentLoadError);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [t.dashboard.recentLoadError]);

  useEffect(() => {
    let isMounted = true;
    const completedCreations = creations.filter((c) => isComplete(c.status));

    async function loadPreviews() {
      for (const creation of completedCreations) {
        if (previewRequestedRef.current.has(creation.id)) continue;
        previewRequestedRef.current.add(creation.id);
        try {
          const outputs = await getMyCreationPreviews(creation.id);
          if (!isMounted) return;
          setPreviews((prev) => ({
            ...prev,
            [creation.id]: { preview: outputs[0] ?? null },
          }));
        } catch {
          if (!isMounted) return;
          setPreviews((prev) => ({
            ...prev,
            [creation.id]: { failed: true, preview: null },
          }));
        }
      }
    }

    void loadPreviews();
    return () => {
      isMounted = false;
    };
  }, [creations]);

  function getStatusLabel(status: MyCreationStatus) {
    if (isComplete(status)) return t.myImages.creationCompleted;
    if (status === "queued") return t.myImages.creationQueued;
    if (
      status === "failed" ||
      status === "credit_refunded" ||
      status === "canceled"
    ) {
      return t.myImages.creationFailed;
    }
    return t.myImages.creationProcessing;
  }

  const hasData = !loading && !loadError && creations.length > 0;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t.dashboard.recentCreationsTitle}</h2>
          {hasData ? (
            <p className="mt-1 text-sm text-white/50">{t.dashboard.recentCreationsSubtitle}</p>
          ) : null}
        </div>
        {hasData ? (
          <Link
            to="/my-images"
            className="mt-1 shrink-0 text-sm font-semibold text-primary-300 transition hover:text-primary-100"
          >
            {t.dashboard.viewAllCreations}
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-white/50">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">{t.myImages.loadingCreations}</span>
        </div>
      ) : null}

      {!loading && loadError ? (
        <p className="mt-6 rounded-[1.25rem] border border-red-400/20 bg-red-400/[0.08] p-4 text-sm text-red-100/85">
          {loadError}
        </p>
      ) : null}

      {!loading && !loadError && creations.length === 0 ? (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-white/14 bg-black/30 p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-white/70">
            {t.dashboard.recentEmptyTitle}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/42">
            {t.dashboard.recentEmptyBody}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            {t.dashboard.startCreating}
          </Link>
        </div>
      ) : null}

      {hasData ? (
        <>
          <ul className="mt-5 space-y-3" aria-label={t.dashboard.recentCreationsTitle}>
            {creations.map((creation) => {
              const previewState = previews[creation.id];
              const preview = previewState?.preview;
              const previewFailed = previewState?.failed;
              const presetName =
                productNameByDbId.get(creation.productId) ?? t.myImages.preset;

              return (
                <li key={creation.id}>
                  <Link
                    to="/my-images"
                    className="flex items-center gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[0.875rem] border border-white/10 bg-black">
                      {preview?.url && !previewFailed ? (
                        <img
                          src={preview.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff className="h-5 w-5 text-white/35" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-white/90">
                          {presetName}
                        </span>
                        <CreationStatusBadge
                          label={getStatusLabel(creation.status)}
                          status={creation.status}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-white/45">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" aria-hidden="true" />
                          {formatDate(creation.createdAt)}
                        </span>
                        <span>
                          {creation.creditCost} {t.myImages.credits}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 text-center">
            <Link
              to="/my-images"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              {t.dashboard.viewAllCreations}
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
