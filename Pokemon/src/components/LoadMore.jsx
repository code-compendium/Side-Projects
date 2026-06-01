import { useI18n } from "../hooks/useI18n.jsx";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadMore({ onClick, loading, hasMore }) {
  const { t } = useI18n();

  if (!hasMore) return null;

  return (
    <div className="load-more-container">
      <button
        className="load-more-button"
        onClick={onClick}
        disabled={loading}
        type="button"
      >
        {loading ? <LoadingSpinner /> : t("loadMore")}
      </button>
    </div>
  );
}
