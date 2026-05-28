import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { ProfileEditor } from "./ProfileEditor";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileModal({ isOpen, onClose }: Props) {
  const { t } = useLanguage();

  // Escape key close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-label={t.settings.personalInformation}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bg-neutral-950, border-white/10, no colored borders */}
      <div className="relative z-10 w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="text-base font-semibold text-white">
            {t.settings.personalInformation}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
            onClick={onClose}
            aria-label={t.settings.close}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <ProfileEditor onSaved={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
