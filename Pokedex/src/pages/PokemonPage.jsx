import { useState, useEffect } from "react";
import { getPokemonList, getPokemonDetails } from "../services/pokemonApi";
import { getPokemonImage } from "../utils/getPokemonImage";
import PokemonCardSkeleton from "../components/PokemonCardSkeleton/PokemonCardSkeleton";
import PokemonCard from "../components/PokemonCard/PokemonCard";

export default function PokemonPage() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        setError(null);
        const list = await getPokemonList(20);
        const detailedPokemon = await Promise.all(
          list.map(async (p) => {
            return await getPokemonDetails(p.url);
          }),
        );

        setPokemon(detailedPokemon);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, []);

  if (loading)
    return (
      <div className="grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <PokemonCardSkeleton key={index} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="error-message">
        Error fetching Pokemon: {error.message}
      </div>
    );
  return (
    <main className="container">
      <h1>Pokemon</h1>
      <ul className="grid">
        {pokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            id={pokemon.id}
            name={pokemon.name}
            image={getPokemonImage(pokemon.sprites)}
            types={pokemon.types.map((type) => type.type.name)}
          />
        ))}
      </ul>
    </main>
  );
}
