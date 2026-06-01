import { useState, useEffect, useCallback } from "react";
import { useLoaderData, Link } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";
import { getRegion, getLocation } from "../api/pokemonApi";
import { capitalize } from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner";

async function fetchRegionLocations(regionName) {
  const locs = await getRegion(regionName);
  const enriched = await Promise.all(
    locs.map(async (loc) => {
      try {
        const detail = await getLocation(loc.name);
        return {
          name: loc.name,
          id: detail.id,
          areaCount: detail.areas?.length || 0,
        };
      } catch {
        return { name: loc.name, id: null, areaCount: 0 };
      }
    })
  );
  return enriched;
}

export default function LocationsPage() {
  const { regions: initialRegions } = useLoaderData();
  const { t } = useI18n();

  const [regionData, setRegionData] = useState(() =>
    initialRegions.map((r) => ({ name: r.name, locations: null, loading: false, error: false }))
  );
  const [expanded, setExpanded] = useState(new Set());

  const toggleRegion = useCallback((regionName) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(regionName)) next.delete(regionName);
      else next.add(regionName);
      return next;
    });
  }, []);

  const startLoad = useCallback((regionName) => {
    setRegionData((prev) => {
      const existing = prev.find((r) => r.name === regionName);
      if (!existing || existing.locations || existing.loading) return prev;
      const updated = prev.map((r) =>
        r.name === regionName ? { ...r, loading: true } : r
      );
      fetchRegionLocations(regionName)
        .then((locs) => {
          setRegionData((p) =>
            p.map((r) =>
              r.name === regionName ? { ...r, locations: locs, loading: false } : r
            )
          );
        })
        .catch(() => {
          setRegionData((p) =>
            p.map((r) =>
              r.name === regionName ? { ...r, loading: false, error: true } : r
            )
          );
        });
      return updated;
    });
  }, []);

  useEffect(() => {
    if (expanded.size === 0) return;
    expanded.forEach(startLoad);
  }, [expanded, startLoad]);

  useEffect(() => {
    const toPrefetch = initialRegions.slice(0, 3);
    toPrefetch.forEach((r) => startLoad(r.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="locations-page">
      <div className="location-regions">
        {regionData.map((region) => {
          const isExpanded = expanded.has(region.name);
          const displayName = capitalize(region.name);
          return (
            <section key={region.name} className="location-region-group">
              <button
                className="location-region-header"
                onClick={() => toggleRegion(region.name)}
                type="button"
                aria-expanded={isExpanded}
              >
                <span className="location-region-name">{displayName}</span>
                <span className={`location-region-arrow ${isExpanded ? "expanded" : ""}`}>
                  &#9662;
                </span>
              </button>
              {isExpanded && (
                <div className="location-region-body">
                  {region.loading && (
                    <div className="loading-center">
                      <LoadingSpinner size={24} />
                    </div>
                  )}
                  {region.error && (
                    <div className="grid-empty">
                      <p>{t("error.fetch")}</p>
                    </div>
                  )}
                  {region.locations && region.locations.length === 0 && (
                    <div className="grid-empty">
                      <p>{t("location.noLocations")}</p>
                    </div>
                  )}
                  {region.locations && region.locations.length > 0 && (
                    <div className="location-grid">
                      {region.locations.map((loc) => (
                        <Link
                          key={loc.name}
                          to={`/locations/${loc.id || loc.name}`}
                          className="location-card"
                        >
                          <div className="location-card-info">
                            <h3 className="location-card-name">
                              {capitalize(loc.name.replace(/-/g, " "))}
                            </h3>
                            <span className="location-card-areas">
                              {loc.areaCount} {loc.areaCount === 1 ? "area" : "areas"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
