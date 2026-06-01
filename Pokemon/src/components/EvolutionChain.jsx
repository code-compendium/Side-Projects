import { Link } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";
import { capitalize, formatId } from "../utils/formatters";

function EvolutionSpecies({ name, id, isCurrent }) {
  const spriteUrl = id
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    : null;

  const fallbackUrl = id
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    : null;

  return (
    <Link
      to={`/pokemon/${id || name}`}
      className={`evolution-species ${isCurrent ? "current" : ""}`}
    >
      {spriteUrl ? (
        <img
          src={spriteUrl}
          alt={name}
          className="evolution-image"
          loading="lazy"
          onError={(e) => {
            if (fallbackUrl) e.target.src = fallbackUrl;
          }}
        />
      ) : (
        <div className="evolution-image-placeholder">?</div>
      )}
      <span className="evolution-name">{capitalize(name)}</span>
      {id && <span className="evolution-id">{formatId(Number(id))}</span>}
    </Link>
  );
}

function isLinear(groups) {
  if (!groups || groups.length <= 1) return true;
  return groups.every((group) => group.length <= 1);
}

export default function EvolutionChain({ groups, currentName }) {
  const { t } = useI18n();

  if (!groups || groups.length === 0) {
    return <p className="evolution-empty">{t("evolution.noEvolutions")}</p>;
  }

  const linear = isLinear(groups);

  if (linear) {
    return (
      <div className="evolution-chain linear">
        {groups.map((group, idx) => (
          <div key={idx} className="evolution-step">
            {idx > 0 && <span className="evolution-arrow">→</span>}
            {group.map((species) => (
              <EvolutionSpecies
                key={species.name}
                name={species.name}
                id={species.id}
                isCurrent={species.name === currentName}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="evolution-chain branched">
      {groups.map((group, idx) => (
        <div key={idx} className="evolution-tier">
          {idx > 0 && <span className="evolution-arrow">↓</span>}
          <div className="evolution-branch-group">
            {group.map((species) => (
              <EvolutionSpecies
                key={species.name}
                name={species.name}
                id={species.id}
                isCurrent={species.name === currentName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
