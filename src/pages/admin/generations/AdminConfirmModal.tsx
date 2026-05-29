import { Loader2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function AdminConfirmModal({ body, cancelLabel, confirmLabel, loading, onCancel, onConfirm, title }: Props) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label={title}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/80">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {!loading && (
            <button type="button" aria-label={cancelLabel} onClick={onCancel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white transition">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" ref={cancelRef} disabled={loading} onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
            {cancelLabel}
          </button>
          <button type="button" disabled={loading} onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
