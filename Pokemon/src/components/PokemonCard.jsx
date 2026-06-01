import { Link } from "react-router";
import { capitalize, formatId } from "../utils/formatters";
import TypeBadge from "./TypeBadge";

export default function PokemonCard({ pokemon }) {
  if (!pokemon || !pokemon.name) return null;

  return (
    <Link to={`/pokemon/${pokemon.id}`} className="pokemon-card">
      <div className="card-image-wrapper">
        {pokemon.image ? (
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="card-image"
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">?</div>
        )}
      </div>
      <div className="card-info">
        <span className="card-id">{formatId(pokemon.id)}</span>
        <h3 className="card-name">{capitalize(pokemon.name)}</h3>
        {pokemon.types && pokemon.types.length > 0 && (
          <div className="card-types">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
