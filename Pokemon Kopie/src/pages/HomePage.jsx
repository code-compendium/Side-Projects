import { useEffect } from "react";
import { getPokemonList } from "../api/pokemonApi";

export default function HomePage() {
  useEffect(() => {
    async function loadPokemon() {
      try {
        const data = await getPokemonList();

        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPokemon();
  }, []);

  return (
    <main>
      <h1>Pokédex</h1>
    </main>
  );
}
