import {
  CalendarDays,
  Hash,
  ImageOff,
  LoaderCircle,
  Mail,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  AdminGenerationDetail,
  AdminGenerationOutput,
} from "../../../lib/adminGenerations";
import { getAdminGenerationDetail } from "../../../lib/adminGenerations";
import type { AdminGenerationStatus } from "../../../lib/adminGenerations";
import { CreationStatusBadge } from "../../../components/my-creations/CreationStatusBadge";

type Labels = {
  close: string;
  detailTitle: string;
  fieldCompletedAt: string;
  fieldErrorCode: string;
  fieldErrorMessage: string;
  fieldId: string;
  fieldInputCount: string;
  fieldModel: string;
  fieldOutputCount: string;
  fieldProductId: string;
  fieldProductSlug: string;
  fieldRetryCount: string;
  fieldStartedAt: string;
  fieldStatus: string;
  fieldUserEmail: string;
  fieldUserId: string;
  fieldUserName: string;
  loadError: string;
  outputsEmpty: string;
  outputsLabel: string;
  outputsLoading: string;
  retryLoad: string;
};

type Props = {
  generationId: string;
  labels: Labels;
  onClose: () => void;
  statusLabel: (status: AdminGenerationStatus) => string;
};

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  mono?: boolean;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs text-white/42">{label}</p>
      <p
        className={`mt-0.5 break-all text-sm text-white/86 ${mono ? "font-mono text-xs" : ""}`}
      >
        {String(value)}
      </p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminGenerationDetailModal({
  generationId,
  labels,
  onClose,
  statusLabel,
}: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [detail, setDetail] = useState<AdminGenerationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    getAdminGenerationDetail(generationId)
      .then((d) => {
        setDetail(d);
        setActiveOutputId(d.outputs[0]?.id ?? null);
      })
      .catch(() => setError(labels.loadError))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationId]);

  const activeOutput: AdminGenerationOutput | undefined =
    detail?.outputs.find((o) => o.id === activeOutputId) ??
    detail?.outputs[0];

  const showImage =
    activeOutput?.url != null && !brokenIds.has(activeOutput.id);

  function markBroken(id: string) {
    setBrokenIds((s) => {
      const next = new Set(s);
      next.add(id);
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

      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <p className="text-sm font-semibold text-white/60">{labels.detailTitle}</p>
          <button
            ref={closeRef}
            type="button"
            aria-label={labels.close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(92vh-4.5rem)] overflow-y-auto">
          {loading && (
            <div className="grid place-items-center py-16">
              <LoaderCircle className="h-7 w-7 animate-spin text-white/50" aria-hidden="true" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-sm text-white/60">{error}</p>
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                onClick={load}
              >
                {labels.retryLoad}
              </button>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
              {/* Left: outputs */}
              <div className="border-b border-white/[0.08] p-5 lg:border-b-0 lg:border-r lg:p-6">
                <p className="mb-3 text-sm font-semibold text-white/60">
                  {labels.outputsLabel}
                </p>
                <div className="flex min-h-[16rem] items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-black">
                  {showImage ? (
                    <img
                      src={activeOutput!.url!}
                      alt=""
                      className="max-h-[56vh] w-full object-contain"
                      onError={() => markBroken(activeOutput!.id)}
                    />
                  ) : (
                    <div className="grid place-items-center gap-3 p-8 text-center">
                      <ImageOff className="h-8 w-8 text-white/38" aria-hidden="true" />
                      <p className="text-sm text-white/50">
                        {detail.outputs.length === 0
                          ? labels.outputsEmpty
                          : labels.outputsLoading}
                      </p>
                    </div>
                  )}
                </div>

                {detail.outputs.length > 1 && (
                  <div className="mt-3 grid grid-cols-6 gap-2">
                    {detail.outputs.map((out, idx) => {
                      const active = out.id === activeOutput?.id;
                      const broken = brokenIds.has(out.id);
                      return (
                        <button
                          key={out.id}
                          type="button"
                          aria-label={`Output ${idx + 1}`}
                          className={`aspect-square overflow-hidden rounded-xl border bg-black transition ${
                            active
                              ? "border-white/50"
                              : "border-white/10 hover:border-white/25"
                          }`}
                          onClick={() => setActiveOutputId(out.id)}
                        >
                          {broken || !out.url ? (
                            <span className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-4 w-4 text-white/38" aria-hidden="true" />
                            </span>
                          ) : (
                            <img
                              src={out.url}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={() => markBroken(out.id)}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: fields */}
              <aside className="space-y-4 p-5 lg:p-6">
                <CreationStatusBadge
                  status={detail.status}
                  label={statusLabel(detail.status)}
                />

                <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/38">
                    <Hash className="h-3 w-3" />
                    Generation
                  </div>
                  <Field label={labels.fieldId} value={detail.id} mono />
                  <Field
                    label={labels.fieldStatus}
                    value={statusLabel(detail.status)}
                  />
                  <Field label={labels.fieldModel} value={
                    [detail.provider, detail.model].filter(Boolean).join(" / ") || null
                  } />
                  <Field label={labels.fieldRetryCount} value={detail.retryCount} />
                  <Field label="Created" value={formatDate(detail.createdAt)} />
                  <Field label={labels.fieldStartedAt} value={formatDate(detail.startedAt)} />
                  <Field label={labels.fieldCompletedAt} value={formatDate(detail.completedAt)} />
                  <Field label={labels.fieldInputCount} value={detail.inputCount} />
                  <Field label={labels.fieldOutputCount} value={detail.outputCount} />
                </div>

                <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/38">
                    <User className="h-3 w-3" />
                    User
                  </div>
                  <Field label={labels.fieldUserId} value={detail.userId} mono />
                  <Field label={labels.fieldUserEmail} value={detail.userEmail} />
                  <Field label={labels.fieldUserName} value={detail.userName} />
                </div>

                <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/38">
                    <CalendarDays className="h-3 w-3" />
                    Product
                  </div>
                  <Field label={labels.fieldProductId} value={detail.productId} mono />
                  <Field label={labels.fieldProductSlug} value={detail.productSlug} />
                </div>

                {(detail.errorCode || detail.errorMessage) && (
                  <div className="space-y-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-300/70">
                      <Mail className="h-3 w-3" />
                      Error
                    </div>
                    <Field label={labels.fieldErrorCode} value={detail.errorCode} mono />
                    <Field label={labels.fieldErrorMessage} value={detail.errorMessage} />
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
