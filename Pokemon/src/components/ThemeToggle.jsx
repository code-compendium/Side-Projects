import { useI18n } from "../hooks/useI18n.jsx";
import { useTheme } from "../hooks/useTheme.jsx";

const THEMES = ["light", "dark", "system"];

const ICONS = {
  light: "\u2600",
  dark: "\u263E",
  system: "\u25D0",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t: translate } = useI18n();

  return (
    <div className="toggle-group" role="radiogroup" aria-label="Theme">
      {THEMES.map((themeKey) => (
        <button
          key={themeKey}
          className={`toggle-button ${theme === themeKey ? "active" : ""}`}
          onClick={() => setTheme(themeKey)}
          role="radio"
          aria-checked={theme === themeKey}
          title={translate(`theme.${themeKey}`)}
          type="button"
        >
          <span aria-hidden="true">{ICONS[themeKey]}</span>
          <span className="toggle-label">{translate(`theme.${themeKey}`)}</span>
        </button>
      ))}
    </div>
  );
}
