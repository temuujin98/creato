import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Image,
  LoaderCircle,
} from "lucide-react";
import {
  getGenerationOutputPreviews,
  type GenerationOutputPreview,
} from "../../lib/generationOutputs";

type OutputPreviewProps = {
  completedDescription?: string;
  completedTitle?: string;
  downloadLabel?: string;
  emptyText: string;
  failedDescription?: string;
  failedTitle?: string;
  generatedAtLabel?: string;
  generationId?: string | null;
  loadingOutputLabel?: string;
  noOutputLabel?: string;
  outputPreviewFailedLabel?: string;
  previewExpiresNote?: string;
  pendingDescription?: string;
  pendingTitle?: string;
  signedUrlFailedLabel?: string;
  status?: "idle" | "queued" | "processing" | "completed" | "failed";
  title: string;
};

export function OutputPreview({
  completedDescription,
  completedTitle,
  downloadLabel,
  emptyText,
  failedDescription,
  failedTitle,
  generatedAtLabel,
  generationId,
  loadingOutputLabel,
  noOutputLabel,
  outputPreviewFailedLabel,
  pendingDescription,
  pendingTitle,
  previewExpiresNote,
  signedUrlFailedLabel,
  status = "idle",
  title,
}: OutputPreviewProps) {
  const [outputs, setOutputs] = useState<GenerationOutputPreview[]>([]);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [outputLoading, setOutputLoading] = useState(false);
  const isPending = status === "queued" || status === "processing";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  useEffect(() => {
    let isMounted = true;

    if (!isCompleted || !generationId) {
      setOutputs([]);
      setOutputError(null);
      setOutputLoading(false);
      return undefined;
    }

    setOutputLoading(true);
    setOutputError(null);

    getGenerationOutputPreviews(generationId)
      .then((nextOutputs) => {
        if (!isMounted) return;
        setOutputs(nextOutputs);
      })
      .catch(() => {
        if (!isMounted) return;
        setOutputs([]);
        setOutputError(outputPreviewFailedLabel ?? signedUrlFailedLabel ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setOutputLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [generationId, isCompleted, outputPreviewFailedLabel, signedUrlFailedLabel]);

  const StateIcon = (() => {
    if (isCompleted) return CheckCircle;
    if (isFailed) return AlertCircle;
    if (status === "processing") return LoaderCircle;
    if (status === "queued") return Clock;
    return Image;
  })();
  const titleText = (() => {
    if (isCompleted) return completedTitle;
    if (isFailed) return failedTitle;
    if (isPending) return pendingTitle;
    return emptyText;
  })();
  const descriptionText = (() => {
    if (isCompleted) return completedDescription;
    if (isFailed) return failedDescription;
    if (isPending) return pendingDescription;
    return null;
  })();

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
      <p className="text-lg font-semibold text-white">{title}</p>
      <div className="mt-5 rounded-[1.35rem] border border-dashed border-white/14 bg-black/36 p-4 text-center">
        {isCompleted && outputLoading ? (
          <div className="flex aspect-square items-center justify-center">
            <div>
              <LoaderCircle
                className="mx-auto h-9 w-9 animate-spin text-primary-300"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm font-semibold text-white/62">
                {loadingOutputLabel}
              </p>
            </div>
          </div>
        ) : isCompleted && outputError ? (
          <div className="flex aspect-square items-center justify-center">
            <div>
              <AlertCircle className="mx-auto h-9 w-9 text-red-300" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-white/62">
                {outputError}
              </p>
              {previewExpiresNote ? (
                <p className="mt-2 text-sm leading-6 text-white/42">
                  {previewExpiresNote}
                </p>
              ) : null}
            </div>
          </div>
        ) : isCompleted && outputs.length > 0 ? (
          <div className="grid gap-4">
            {outputs.map((output, index) => (
              <article
                key={output.id}
                className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/50 text-left"
              >
                <img
                  src={output.url}
                  alt={`${completedTitle ?? title} ${index + 1}`}
                  className="max-h-[34rem] w-full object-contain"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {completedTitle}
                    </p>
                    {output.createdAt && generatedAtLabel ? (
                      <p className="mt-1 text-xs text-white/44">
                        {generatedAtLabel}:{" "}
                        {new Date(output.createdAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={output.url}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/28 hover:bg-white/8"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {downloadLabel}
                  </a>
                </div>
              </article>
            ))}
            {previewExpiresNote ? (
              <p className="text-left text-xs leading-5 text-white/38">
                {previewExpiresNote}
              </p>
            ) : null}
          </div>
        ) : isCompleted ? (
          <div className="flex aspect-square items-center justify-center">
            <div>
              <Image className="mx-auto h-9 w-9 text-white/38" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-white/62">
                {noOutputLabel}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center">
            <div>
              <StateIcon
                className={`mx-auto h-9 w-9 ${
                    isCompleted
                    ? "text-primary-300"
                    : isFailed
                      ? "text-white/64"
                      : "text-white/42"
                } ${status === "processing" ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <p className="mt-4 text-sm font-semibold text-white/62">
                {titleText}
              </p>
              {descriptionText ? (
                <p className="mt-2 text-sm leading-6 text-white/42">
                  {descriptionText}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
