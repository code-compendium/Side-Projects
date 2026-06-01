import { useLoaderData, Link } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";
import { capitalize } from "../utils/formatters";

export default function LocationDetailPage() {
  const { location, areaEncounters } = useLoaderData();
  const { t } = useI18n();

  if (!location) {
    return (
      <div className="detail-error">
        <h2>{t("error.notFound")}</h2>
        <Link to="/locations">{t("detail.back")}</Link>
      </div>
    );
  }

  const regionName = location.region?.name
    ? capitalize(location.region.name.replace("-", " "))
    : "";
  const displayName = capitalize(location.name.replace(/-/g, " "));

  const totalPokemon = new Set(
    areaEncounters.flatMap((area) => area.pokemon.map((p) => p.name))
  );

  return (
    <div className="detail-page location-detail">
      <Link to="/locations" className="detail-back">{t("detail.back")}</Link>

      <div className="detail-header">
        <div className="detail-info">
          <h1 className="detail-name">{displayName}</h1>
          {regionName && (
            <span className="detail-id">{regionName}</span>
          )}
          <div className="detail-measurements">
            <div className="measurement">
              <span className="measurement-label">{t("location.areas")}</span>
              <span className="measurement-value">{areaEncounters.length}</span>
            </div>
            <div className="measurement">
              <span className="measurement-label">{t("location.pokemon")}</span>
              <span className="measurement-value">{totalPokemon.size}</span>
            </div>
          </div>
        </div>
      </div>

      {areaEncounters.map((area) => (
        <section key={area.areaName} className="detail-section">
          <h2 className="section-title">
            {capitalize(area.areaName.replace(/-/g, " "))}
          </h2>
          {area.pokemon.length === 0 ? (
            <p className="evolution-empty">—</p>
          ) : (
            <div className="encounter-pokemon-list">
              {area.pokemon.map((p) => (
                <Link
                  key={p.name}
                  to={`/pokemon/${p.id || p.name}`}
                  className="encounter-pokemon-chip"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id || p.name}.png`}
                    alt={p.name}
                    className="encounter-pokemon-sprite"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span>{capitalize(p.name)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
