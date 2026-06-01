import { Link, useLocation } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";

const TABS = [
  { path: "/", labelKey: "nav.pokemon" },
  { path: "/berries", labelKey: "nav.berries" },
  { path: "/locations", labelKey: "nav.locations" },
];

export default function NavTabs() {
  const { t } = useI18n();
  const location = useLocation();

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <nav className="nav-tabs">
      {TABS.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`nav-tab ${isActive(tab.path) ? "active" : ""}`}
        >
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
