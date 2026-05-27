import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type Language, languages, translations } from "../i18n/translations";
import { LanguageContext } from "./language-context";

const storageKey = "creato-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "mn";
  }

  const stored = window.localStorage.getItem(storageKey);
  return languages.includes(stored as Language) ? (stored as Language) : "mn";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: translations[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
