import { Check, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import type { Language } from "../../i18n/translations";

const languageOptions: Array<{
  englishLabel: string;
  nativeLabel: string;
  value: Language;
}> = [
  { englishLabel: "Mongolian", nativeLabel: "Монгол", value: "mn" },
  { englishLabel: "English", nativeLabel: "English", value: "en" },
];

const triggerClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition hover:bg-black/5 hover:text-black dark:border-white/10 dark:bg-neutral-950 dark:text-white/80 dark:hover:border-primary/40 dark:hover:bg-white/5 dark:hover:text-white";

export function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative z-[130]" ref={menuRef}>
      <button
        type="button"
        className={triggerClass}
        aria-label={t.nav.selectLanguage}
        aria-expanded={isOpen}
        title={t.nav.language}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-[999] mt-3 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-black/10 bg-white p-2 text-neutral-950 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:shadow-black/60">
          <div className="grid gap-1">
            {languageOptions.map((option) => {
              const selected = option.value === language;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    selected
                      ? "bg-black/5 dark:bg-white/10"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  onClick={() => {
                    setLanguage(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-neutral-950 dark:text-white/90">
                      {option.nativeLabel}
                    </span>
                    <span className="mt-0.5 block text-xs text-black/50 dark:text-white/50">
                      {option.englishLabel}
                    </span>
                  </span>
                  {selected ? (
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
