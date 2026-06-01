import "./styles/App.css";
import { PokemonCard } from "./components/PokemonCard";
import HomePage from "./pages/HomePage";
import { useState, useEffect } from "react";
export function App() {
  const [status, setStatus] = useState({ type: "loading" });

  useEffect(() => {
    const controller = new AbortController(); // Prevent memory leaks

    async function fetchFullPokemonData() {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=20",
          {
            signal: controller.signal,
          },
        );
        const listData = await response.json();

        const detailPromises = listData.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url, { signal: controller.signal });
          const details = await res.json();
          return {
            name: details.name,
            image: details.sprites.front_default,
          };
        });
        if (!response.ok) throw new Error("Failed to load list");
        const fullData = await Promise.all(detailPromises);
        setStatus({ type: "success", data: fullData });
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus({ type: "error", error: error.message });
        }
      }
    }
    fetchFullPokemonData();
    return () => controller.abort();
  }, []);

  const statusUI = {
    loading: <div>Laden...</div>,
    error: <div>Fout: {status.error}</div>,
    success: status.data && (
      <main>
        <h1>Pokemon</h1>
        <div className="wrapper">
          <div className="card-grid">
            {status.data.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </div>
        </div>
      </main>
    ),
  };

  return <div className="app-container">{statusUI[status.type]}</div>;
}

export default App;
