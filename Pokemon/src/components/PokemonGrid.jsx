import { useI18n } from "../hooks/useI18n.jsx";
import PokemonCard from "./PokemonCard";

function SkeletonGrid() {
  return (
    <div className="pokemon-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="pokemon-card skeleton">
          <div className="card-image-wrapper">
            <div className="skeleton-image" />
          </div>
          <div className="card-info">
            <div className="skeleton-text skeleton-id" />
            <div className="skeleton-text skeleton-name" />
            <div className="skeleton-text skeleton-types" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PokemonGrid({ pokemon, loading, search }) {
  const { t } = useI18n();

  if (loading) {
    return <SkeletonGrid />;
  }

  if (!pokemon || pokemon.length === 0) {
    return (
      <div className="grid-empty">
        {search ? (
          <p>
            {t("search.noResults")} "<strong>{search}</strong>"
          </p>
        ) : (
          <p>{t("error.fetch")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="pokemon-grid">
      {pokemon.map((p) => (
        <PokemonCard key={p.id || p.name} pokemon={p} />
      ))}
    </div>
  );
}
