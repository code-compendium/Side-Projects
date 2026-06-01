import { useLoaderData, Link } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";
import TypeBadge from "../components/TypeBadge";
import StatBar from "../components/StatBar";
import EvolutionChain from "../components/EvolutionChain";
import { capitalize, formatId, formatHeight, formatWeight } from "../utils/formatters";
import "../styles/detail.css";

export default function PokemonDetailPage() {
  const { pokemon, evolutionGroups, flavorText, flavorTextNl } =
    useLoaderData();
  const { t, lang } = useI18n();

  if (!pokemon) {
    return (
      <div className="detail-error">
        <h2>{t("error.notFound")}</h2>
        <Link to="/">{t("detail.back")}</Link>
      </div>
    );
  }

  const officialArt =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default;

  const displayFlavor = lang === "nl" && flavorTextNl ? flavorTextNl : flavorText;
  const types = (pokemon.types || []).map((t) => t.type?.name).filter(Boolean);
  const abilities = (pokemon.abilities || []).map((a) => ({
    name: a.ability?.name || "",
    isHidden: a.is_hidden || false,
  }));
  const stats = (pokemon.stats || []).map((s) => ({
    name: s.stat?.name || "",
    value: s.base_stat || 0,
  }));

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back">
        {t("detail.back")}
      </Link>

      <div className="detail-header">
        <div className="detail-image-wrapper">
          <img
            src={officialArt}
            alt={pokemon.name}
            className="detail-image"
            loading="lazy"
          />
        </div>

        <div className="detail-info">
          <span className="detail-id">{formatId(pokemon.id)}</span>
          <h1 className="detail-name">{capitalize(pokemon.name)}</h1>

          <div className="detail-types">
            {types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>

          <div className="detail-measurements">
            <div className="measurement">
              <span className="measurement-label">{t("detail.height")}</span>
              <span className="measurement-value">
                {formatHeight(pokemon.height)}
              </span>
            </div>
            <div className="measurement">
              <span className="measurement-label">{t("detail.weight")}</span>
              <span className="measurement-value">
                {formatWeight(pokemon.weight)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {displayFlavor && (
        <section className="detail-section">
          <h2 className="section-title">{t("detail.flavorText")}</h2>
          <p className="detail-flavor">{displayFlavor}</p>
        </section>
      )}

      {abilities.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">{t("detail.abilities")}</h2>
          <div className="detail-abilities">
            {abilities.map((a) => (
              <span
                key={a.name}
                className={`ability-badge ${a.isHidden ? "hidden-ability" : ""}`}
              >
                {capitalize(a.name.replace("-", " "))}
                {a.isHidden && (
                  <span className="hidden-label">{t("detail.hiddenAbility")}</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">{t("detail.stats")}</h2>
          <div className="detail-stats">
            {stats.map((s) => (
              <StatBar key={s.name} name={s.name} value={s.value} />
            ))}
          </div>
        </section>
      )}

      {evolutionGroups.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">{t("detail.evolution")}</h2>
          <EvolutionChain groups={evolutionGroups} currentName={pokemon.name} />
        </section>
      )}
    </div>
  );
}
