import { Clock, Image, LoaderCircle } from "lucide-react";

type OutputPreviewProps = {
  emptyText: string;
  pendingDescription?: string;
  pendingTitle?: string;
  status?: "idle" | "queued" | "processing";
  title: string;
};

export function OutputPreview({
  emptyText,
  pendingDescription,
  pendingTitle,
  status = "idle",
  title,
}: OutputPreviewProps) {
  const isPending = status === "queued" || status === "processing";
  const PendingIcon = status === "processing" ? LoaderCircle : Clock;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
      <p className="text-lg font-semibold text-white">{title}</p>
      <div className="mt-5 flex aspect-square items-center justify-center rounded-[1.35rem] border border-dashed border-white/14 bg-black/36 p-6 text-center">
        <div>
          {isPending ? (
            <PendingIcon
              className={`mx-auto h-9 w-9 text-white/42 ${
                status === "processing" ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />
          ) : (
            <Image className="mx-auto h-9 w-9 text-white/34" aria-hidden="true" />
          )}
          <p className="mt-4 text-sm font-semibold text-white/62">
            {isPending ? pendingTitle : emptyText}
          </p>
          {isPending && pendingDescription ? (
            <p className="mt-2 text-sm leading-6 text-white/42">
              {pendingDescription}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
