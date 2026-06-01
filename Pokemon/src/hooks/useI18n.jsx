import { createContext, useContext, useState, useCallback } from "react";
import dict from "../utils/i18n";

const I18nContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem("pokedex-lang");
    if (stored === "nl" || stored === "en") return stored;
  } catch {
    return "en";
  }
  return "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLanguage);

  const setLanguage = useCallback((newLang) => {
    if (newLang !== "nl" && newLang !== "en") return;
    setLangState(newLang);
    try {
      localStorage.setItem("pokedex-lang", newLang);
    } catch {
      return;
    }
  }, []);

  const t = useCallback(
    (key) => {
      const translation = dict[lang]?.[key];
      if (translation !== undefined) return translation;
      const fallback = dict.en?.[key];
      if (fallback !== undefined) return fallback;
      return key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
