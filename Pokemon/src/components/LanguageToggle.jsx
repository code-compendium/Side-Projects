import { useI18n } from "../hooks/useI18n.jsx";

export default function LanguageToggle() {
  const { lang, setLanguage } = useI18n();

  return (
    <div className="toggle-group" role="radiogroup" aria-label="Language">
      <button
        className={`toggle-button ${lang === "nl" ? "active" : ""}`}
        onClick={() => setLanguage("nl")}
        role="radio"
        aria-checked={lang === "nl"}
        type="button"
      >
        NL
      </button>
      <button
        className={`toggle-button ${lang === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        role="radio"
        aria-checked={lang === "en"}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
