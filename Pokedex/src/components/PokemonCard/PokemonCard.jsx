import "./PokemonCard.css";
export default function PokemonCard({ id, name, image, types }) {
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return (
    <article className="pokemon-card">
      <img src={image} alt={name} loading="lazy" />

      <div className="pokemon-card__body">
        <h2 className="pokemon-card__name">{capitalize(name)}</h2>
        <p className="pokemon-card__id">#{id}</p>

        <ul className="pokemon-card__types">
          {types.map((type) => (
            <li key={type}>{capitalize(type)}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
