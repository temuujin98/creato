import { useEffect } from "react";

type LightboxProps = {
  alt: string;
  closeLabel: string;
  image: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
};

export function Lightbox({
  alt,
  closeLabel,
  image,
  isOpen,
  title,
  onClose,
}: LightboxProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/82 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[1.75rem] border border-white/12 bg-ink p-3 shadow-glow"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-5 top-5 z-10 rounded-full border border-white/12 bg-black/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
          onClick={onClose}
        >
          {closeLabel}
        </button>
        <img
          src={image}
          alt={alt}
          className="aspect-square w-full rounded-[1.35rem] object-cover"
        />
        <p className="px-2 pb-2 pt-4 text-lg font-semibold text-white">
          {title}
        </p>
      </div>
    </div>
  );
}
