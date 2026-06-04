import "./PokemonCardSkeleton.css";

export default function PokemonCardSkeleton() {
  return (
    <div className="card skeleton">
      <div className="image" />
      <div className="line short" />
      <div className="line long" />
    </div>
  );
}
