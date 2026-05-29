import { CalendarDays, Eye, ImageOff, Sparkles } from "lucide-react";
import type {
  MyCreation,
  MyCreationOutputPreview,
} from "../../lib/myCreations";
import { buildDownloadFilename } from "../../lib/download";
import { DownloadButton } from "../ui/DownloadButton";
import { CreationStatusBadge } from "./CreationStatusBadge";

type Props = {
  creation: MyCreation;
  errorCopy?: string;
  labels: {
    createdAt: string;
    creditCost: string;
    credits: string;
    download: string;
    presetFallback: string;
    previewUnavailable: string;
    viewDetails: string;
  };
  onOpenDetails: () => void;
  presetName: string;
  preview?: MyCreationOutputPreview | null;
  previewFailed?: boolean;
  statusLabel: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function canDownload(creation: MyCreation, preview?: MyCreationOutputPreview | null) {
  return (
    Boolean(preview?.url) &&
    (creation.status === "completed" || creation.status === "credit_spent")
  );
}

export function CreationCard({
  creation,
  errorCopy,
  labels,
  onOpenDetails,
  presetName,
  preview,
  previewFailed = false,
  statusLabel,
}: Props) {
  const downloadReady = canDownload(creation, preview);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/30 transition hover:border-primary/40">
      <div className="relative aspect-square overflow-hidden bg-black">
        {preview?.url ? (
          <img
            src={preview.url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.22),rgba(10,10,10,0.95)_55%)]">
            <div className="grid justify-items-center gap-3 text-center">
              <ImageOff className="h-8 w-8 text-white/45" aria-hidden="true" />
              <p className="max-w-[12rem] text-sm leading-6 text-white/50">
                {previewFailed ? labels.previewUnavailable : statusLabel}
              </p>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <CreationStatusBadge label={statusLabel} status={creation.status} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-primary-200">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-white/90">
              {presetName || labels.presetFallback}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {labels.createdAt}: {formatDate(creation.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
          <p className="text-sm text-white/50">
            {labels.creditCost}:{" "}
            <span className="font-semibold text-white/90">
              {creation.creditCost} {labels.credits}
            </span>
          </p>

          {downloadReady ? (
            <DownloadButton
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-primary/40 hover:bg-primary/15 hover:text-white"
              filename={buildDownloadFilename(presetName, creation.createdAt)}
              label={labels.download}
              url={preview!.url}
            />
          ) : null}
        </div>

        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-primary/40 hover:bg-primary/15 hover:text-white"
          onClick={onOpenDetails}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          {labels.viewDetails}
        </button>

        {errorCopy ? (
          <p className="mt-4 rounded-2xl border border-red-400/15 bg-red-400/[0.08] p-3 text-sm leading-6 text-red-100/85">
            {errorCopy}
          </p>
        ) : null}
      </div>
    </article>
  );
}
