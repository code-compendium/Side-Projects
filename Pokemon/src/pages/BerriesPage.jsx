import { useState, useEffect, useCallback, useRef } from "react";
import { useLoaderData, useSearchParams, useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { useDebounce } from "../hooks/useDebounce";
import { useI18n } from "../hooks/useI18n.jsx";
import { getBerryList, getBerry } from "../api/pokemonApi";
import { capitalize } from "../utils/formatters";
import { PAGE_LIMIT, BERRY_FLAVOR_COLORS } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

function BerryCard({ berryName }) {
  const [berry, setBerry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getBerry(berryName)
      .then((data) => { if (!cancelled) setBerry(data); })
      .catch(() => { if (!cancelled) setBerry(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [berryName]);

  if (loading) {
    return (
      <div className="berry-card skeleton">
        <div className="berry-card-image skeleton-image" />
        <div className="berry-card-info">
          <div className="skeleton-text" style={{ width: "80px" }} />
        </div>
      </div>
    );
  }

  if (!berry) return null;

  const dominantFlavor = (berry.flavors || [])
    .map((f) => ({ name: f.flavor?.name, potency: f.potency || 0 }))
    .sort((a, b) => b.potency - a.potency)[0];

  const flavorColor = dominantFlavor?.potency > 0
    ? BERRY_FLAVOR_COLORS[dominantFlavor.name] || "#999"
    : "#999";

  return (
    <Link to={`/berries/${berry.id}`} className="berry-card">
      <div
        className="berry-card-image"
        style={{ backgroundColor: flavorColor + "22", borderColor: flavorColor }}
      >
        <span className="berry-emoji" style={{ color: flavorColor }}>
          🫐
        </span>
      </div>
      <div className="berry-card-info">
        <span className="berry-card-name">{capitalize(berry.name.replace("-", " "))}</span>
        <span className="berry-card-size">{berry.size || "—"}</span>
      </div>
    </Link>
  );
}

export default function BerriesPage() {
  const initialData = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [berries, setBerries] = useState(initialData.berries || []);
  const [hasMore, setHasMore] = useState(initialData.hasMore || false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const initialDataSet = useRef(false);

  const searchParam = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (!initialDataSet.current) {
      initialDataSet.current = true;
      return;
    }
    setBerries(initialData.berries || []);
    setHasMore(initialData.hasMore || false);
    setLocalLoading(false);
  }, [initialData]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.delete("offset");
      navigate(`/berries?${params.toString()}`, { replace: true });
    }
  }, [debouncedSearch, searchParams, navigate]);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const offset = berries.length;
      const data = await getBerryList({ limit: PAGE_LIMIT, offset });
      setBerries((prev) => [...prev, ...(data.berries || [])]);
      setHasMore(data.hasMore);
    } catch {
      toast.error(t("error.fetch"));
    } finally {
      setLoadingMore(false);
    }
  }, [berries.length, t]);

  const showLoadMore = hasMore && !searchParam && berries.length > 0;

  return (
    <div className="berries-page">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder={t("berry.search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          maxLength={20}
        />
        {searchInput && (
          <button className="search-clear" onClick={() => setSearchInput("")} type="button">&times;</button>
        )}
      </div>

      {localLoading ? (
        <div className="loading-center">
          <LoadingSpinner size={40} />
        </div>
      ) : berries.length === 0 ? (
        <div className="grid-empty">
          {searchParam ? (
            <p>{t("search.noResults")} "<strong>{searchParam}</strong>"</p>
          ) : (
            <p>{t("error.fetch")}</p>
          )}
        </div>
      ) : (
        <div className="berry-grid">
          {berries.map((b) => (
            <BerryCard key={b.name} berryName={b.name} />
          ))}
        </div>
      )}

      {showLoadMore && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore} disabled={loadingMore} type="button">
            {loadingMore ? <LoadingSpinner /> : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
