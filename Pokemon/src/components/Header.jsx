import { useI18n } from "../hooks/useI18n.jsx";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import NavTabs from "./NavTabs";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">{t("app.title")}</h1>
          <NavTabs />
        </div>
        <div className="header-controls">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
