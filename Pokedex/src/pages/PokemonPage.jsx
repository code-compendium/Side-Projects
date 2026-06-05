// FILE: src/pages/PokemonPage.jsx

import { useEffect, useState, useMemo } from "react";
import { getPokemonList, getPokemonDetails } from "../services/pokemonApi";
import { chunkArray } from "../utils/chunkArray";

import PokemonCardSkeleton from "../components/pokemoncardskeleton/PokemonCardSkeleton";
import PokemonCard from "../components/pokemoncard/PokemonCard";

export default function PokemonPage() {
  // =========================
  // STATE (source of truth)
  // =========================
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTypes, setSelectedTypes] = useState([]);

  // =========================
  // CONFIG
  // =========================
  const BATCH_SIZE = 20;

  // =========================
  // DERIVED STATE (FILTER LAYER)
  // =========================
  const filteredPokemon = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return pokemon.filter((pokemon) => {
      const matchesSearch =
        !normalizedSearch ||
        pokemon.name.toLowerCase().includes(normalizedSearch);
      const matchesTypes =
        selectedTypes.length === 0 ||
        selectedTypes.every((selectedType) =>
          pokemon.types.some((typeInfo) => typeInfo.type.name === selectedType),
        );
      return matchesSearch && matchesTypes;
    });
  }, [pokemon, search, selectedTypes]);

  const availableTypes = useMemo(() => {
    const types = new Set();

    pokemon.forEach((pokemon) => {
      pokemon.types.forEach((typeInfo) => {
        types.add(typeInfo.type.name);
      });
    });

    return [...types].sort();
  }, [pokemon]);
  // =========================
  // HELPER FUNCTIONS
  // =========================
  function resetFilters() {
    setSearch("");
    setSelectedTypes([]);
  }
  // =========================
  // DATA LOADER (BATCHED)
  // =========================
  async function loadAllPokemonBatched(results) {
    const chunks = chunkArray(results, BATCH_SIZE);

    const allPokemon = [];

    for (const chunk of chunks) {
      const batch = await Promise.all(
        chunk.map((p) => getPokemonDetails(p.url)),
      );

      allPokemon.push(...batch);
    }

    return allPokemon;
  }

  // =========================
  // SIDE EFFECTS (API CALL)
  // =========================
  useEffect(() => {
    async function loadAllPokemon() {
      try {
        setLoading(true);
        setError(null);

        // STEP 1: fetch lightweight list
        const data = await getPokemonList(20);

        if (!data?.results) {
          throw new Error("Invalid API response: missing results");
        }

        // STEP 2: fetch details in batches
        const detailed = await loadAllPokemonBatched(data.results);

        // STEP 3: set source of truth
        setPokemon(detailed);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadAllPokemon();
  }, []);

  // =========================
  // EARLY RETURNS (UI STATES)
  // =========================
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 20 }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // =========================
  // RENDER
  // =========================
  return (
    <main className="container">
      <h1>Pokemon</h1>

      {/* TYPE INPUT */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;
          setSelectedTypes((prev) =>
            prev.includes(value) ? prev : [...prev, value],
          );
        }}
      >
        <option value="">Select type</option>
        {availableTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <div>
        {selectedTypes.map((type) => (
          <button
            key={type}
            onClick={() =>
              setSelectedTypes((prev) => prev.filter((t) => t !== type))
            }
          >
            {type} ✕
          </button>
        ))}
      </div>

      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Reset Button */}
      <button onClick={resetFilters}>Reset Filters</button>

      {/* GRID */}
      <div className="grid">
        {filteredPokemon.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            image={p.sprites?.other?.["official-artwork"]?.front_default}
            types={p.types.map((t) => t.type.name)}
          />
        ))}
      </div>
    </main>
  );
}
