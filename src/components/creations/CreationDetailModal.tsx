import {
  CalendarDays,
  ImageOff,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  MyCreation,
  MyCreationOutputPreview,
} from "../../lib/myCreations";
import { listCreationOutputsForCreation } from "../../lib/myCreations";
import { buildDownloadFilename } from "../../lib/download";
import { CreditIcon } from "../ui/CreditIcon";
import { DownloadButton } from "../ui/DownloadButton";
import { CreationStatusBadge } from "../my-creations/CreationStatusBadge";

type Props = {
  creation: MyCreation;
  errorCopy?: string;
  initialPreview?: MyCreationOutputPreview | null;
  labels: {
    close: string;
    createdDate: string;
    credits: string;
    creditsUsed: string;
    detailTitle: string;
    download: string;
    emptyOutputs: string;
    failedRefundNotice: string;
    failedTitle: string;
    loadingOutputs: string;
    outputLabel: string;
    outputsLoadFailed: string;
    previewUnavailable: string;
  };
  onClose: () => void;
  presetName: string;
  statusLabel: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isCompleted(creation: MyCreation) {
  return creation.status === "completed" || creation.status === "credit_spent";
}

export function CreationDetailModal({
  creation,
  errorCopy,
  initialPreview,
  labels,
  onClose,
  presetName,
  statusLabel,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeOutputId, setActiveOutputId] = useState<string | null>(
    initialPreview?.id ?? null,
  );
  const [brokenOutputIds, setBrokenOutputIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isCompleted(creation));
  const [outputs, setOutputs] = useState<MyCreationOutputPreview[]>(
    initialPreview ? [initialPreview] : [],
  );

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isCompleted(creation)) {
      setLoading(false);
      setOutputs([]);
      setActiveOutputId(null);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    listCreationOutputsForCreation(creation.id)
      .then((nextOutputs) => {
        if (!isMounted) return;
        setOutputs(nextOutputs);
        setActiveOutputId((current) => current ?? nextOutputs[0]?.id ?? null);
        setLoadError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError(labels.outputsLoadFailed);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [creation, labels.outputsLoadFailed]);

  const activeOutput = useMemo(() => {
    return outputs.find((output) => output.id === activeOutputId) ?? outputs[0];
  }, [activeOutputId, outputs]);
  const activeOutputBroken = activeOutput
    ? brokenOutputIds.has(activeOutput.id)
    : false;
  const showPreview = Boolean(activeOutput?.url) && !activeOutputBroken;
  const failed = !isCompleted(creation);

  function markOutputBroken(outputId: string) {
    setBrokenOutputIds((current) => {
      const next = new Set(current);
      next.add(outputId);
      return next;
    });
  }

  return createPortal(
    <div
      aria-label={labels.detailTitle}
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-end justify-center p-3 text-white sm:items-center sm:p-6"
      role="dialog"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/50">
              {labels.detailTitle}
            </p>
            <h2 className="truncate text-xl font-semibold text-white/90">
              {presetName}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            aria-label={labels.close}
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-4.5rem)] overflow-y-auto lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="border-b border-white/[0.08] p-4 lg:border-b-0 lg:border-r lg:p-6">
            <div className="flex min-h-[20rem] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black md:min-h-[32rem]">
              {showPreview ? (
                <img
                  src={activeOutput?.url}
                  alt=""
                  className="max-h-[72vh] w-full object-contain"
                  onError={() => {
                    if (activeOutput) markOutputBroken(activeOutput.id);
                  }}
                />
              ) : (
                <div className="grid justify-items-center gap-3 px-6 text-center">
                  {loading ? (
                    <LoaderCircle
                      className="h-8 w-8 animate-spin text-white/60"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImageOff className="h-9 w-9 text-white/45" aria-hidden="true" />
                  )}
                  <p className="max-w-sm text-sm leading-6 text-white/52">
                    {loading
                      ? labels.loadingOutputs
                      : failed
                        ? labels.emptyOutputs
                        : labels.previewUnavailable}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-white/70">
                {labels.outputLabel}
              </p>
              {loading ? (
                <p className="mt-3 text-sm text-white/50">{labels.loadingOutputs}</p>
              ) : null}
              {!loading && loadError ? (
                <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/[0.08] p-3 text-sm text-red-100/85">
                  {loadError}
                </p>
              ) : null}
              {!loading && !loadError && outputs.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/52">
                  {labels.emptyOutputs}
                </p>
              ) : null}
              {outputs.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {outputs.map((output, index) => {
                    const active = output.id === activeOutput?.id;
                    const broken = brokenOutputIds.has(output.id);

                    return (
                      <div key={output.id} className="grid gap-2">
                        <button
                          type="button"
                          className={`aspect-square overflow-hidden rounded-2xl border bg-black transition ${
                            active
                              ? "border-primary"
                              : "border-white/10 hover:border-white/25"
                          }`}
                          aria-label={`${labels.outputLabel} ${index + 1}`}
                          onClick={() => setActiveOutputId(output.id)}
                        >
                          {broken ? (
                            <span className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-5 w-5 text-white/45" aria-hidden="true" />
                            </span>
                          ) : (
                            <img
                              src={output.url}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={() => markOutputBroken(output.id)}
                            />
                          )}
                        </button>
                        {!broken ? (
                          <DownloadButton
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2 py-1.5 text-xs font-semibold text-white/80 transition hover:border-primary/40 hover:bg-primary/15 hover:text-white"
                            filename={buildDownloadFilename(
                              presetName,
                              output.createdAt ?? creation.createdAt,
                              index,
                            )}
                            iconClassName="h-3.5 w-3.5"
                            label={labels.download}
                            url={output.url}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-5 p-5 lg:p-6">
            <CreationStatusBadge label={statusLabel} status={creation.status} />

            <div>
              <p className="text-sm text-white/50">{labels.createdDate}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/90">
                <CalendarDays className="h-4 w-4 text-white/50" aria-hidden="true" />
                {formatDate(creation.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm text-white/50">{labels.creditsUsed}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/90">
                <CreditIcon className="h-4 w-4" />
                {creation.creditCost} {labels.credits}
              </p>
            </div>

            {activeOutput?.url && !activeOutputBroken ? (
              <DownloadButton
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
                filename={buildDownloadFilename(
                  presetName,
                  activeOutput.createdAt ?? creation.createdAt,
                )}
                label={labels.download}
                url={activeOutput.url}
              />
            ) : null}

            {failed ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.08] p-4">
                <p className="text-sm font-semibold text-red-100">
                  {labels.failedTitle}
                </p>
                {errorCopy ? (
                  <p className="mt-2 text-sm leading-6 text-red-100/80">{errorCopy}</p>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-red-100/70">
                  {labels.failedRefundNotice}
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}
