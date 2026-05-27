import { createContext } from "react";
import type { Language, translations } from "../i18n/translations";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);
