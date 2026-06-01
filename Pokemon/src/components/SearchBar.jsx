import { useCallback } from "react";
import { useI18n } from "../hooks/useI18n.jsx";
import { sanitizeSearch } from "../utils/validators";

export default function SearchBar({ value, onChange }) {
  const { t } = useI18n();

  const handleChange = useCallback(
    (e) => {
      const sanitized = sanitizeSearch(e.target.value);
      onChange(sanitized);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={t("search.placeholder")}
        value={value || ""}
        onChange={handleChange}
        maxLength={20}
        aria-label={t("search.placeholder")}
      />
      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  );
}
