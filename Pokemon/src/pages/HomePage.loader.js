import { getPokemonList, getPokemonByName, getPokemonById, getPokemonByType, getGeneration } from "../api/pokemonApi";
import { PAGE_LIMIT } from "../utils/constants";

function extractIdFromUrl(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, "").split("/");
  const id = parseInt(parts[parts.length - 1], 10);
  return Number.isFinite(id) ? id : null;
}

async function fetchWithRetry(id, signal, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await getPokemonById(id, signal);
    } catch (err) {
      if (i === attempts - 1 || signal?.aborted) throw err;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
}

async function fetchPokemonDetails(pokemonList, signal) {
  const BATCH = 20;
  const details = [];
  for (let i = 0; i < pokemonList.length; i += BATCH) {
    if (signal?.aborted) break;
    const batch = pokemonList.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (p) => {
        try {
          const id = extractIdFromUrl(p.url);
          if (!id) return null;
          const detail = await fetchWithRetry(id, signal);
          return {
            name: detail.name,
            id: detail.id,
            image: detail.sprites?.front_default || null,
            types: (detail.types || []).map((t) => t.type?.name).filter(Boolean),
          };
        } catch {
          return null;
        }
      })
    );
    details.push(...results.filter(Boolean));
  }
  return details;
}

async function fetchPokemonByTypes(types, signal) {
  const typeSets = await Promise.all(
    types.map((t) => getPokemonByType(t, signal))
  );
  if (!typeSets.length) return [];
  const counts = new Map();
  typeSets.forEach((list) => {
    const seen = new Set();
    list.forEach((p) => {
      const name = p.name || p.pokemon?.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    });
  });
  const result = [];
  counts.forEach((count, name) => {
    if (count === types.length) {
      const original = typeSets[0].find((p) => (p.name || p.pokemon?.name) === name);
      result.push({
        name,
        url: original?.url || original?.pokemon?.url || "",
      });
    }
  });
  return result;
}

export async function homeLoader({ request }) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const typeStr = url.searchParams.get("type") || "";
  const typeFilters = typeStr ? typeStr.split(",").filter(Boolean) : [];
  const genFilter = url.searchParams.get("generation") || "";

  if (search) {
    try {
      const pokemon = await getPokemonByName(search);
      return {
        pokemon: pokemon ? [pokemon] : [],
        total: pokemon ? 1 : 0,
        hasMore: false,
        search,
      };
    } catch {
      return { pokemon: [], total: 0, hasMore: false, search };
    }
  }

  let allPokemon;

  if (typeFilters.length > 0 && genFilter) {
    const [typePokemon, genData] = await Promise.all([
      fetchPokemonByTypes(typeFilters, request?.signal),
      getGeneration(genFilter, request?.signal),
    ]);
    const genNames = new Set((genData.pokemon_species || []).map((s) => s.name));
    allPokemon = typePokemon.filter((p) => genNames.has(p.name));
  } else if (typeFilters.length > 0) {
    allPokemon = await fetchPokemonByTypes(typeFilters, request?.signal);
  } else if (genFilter) {
    const genData = await getGeneration(genFilter, request?.signal);
    allPokemon = (genData.pokemon_species || []).map((s) => ({
      name: s.name,
      url: s.url,
    }));
  } else {
    const data = await getPokemonList({ limit: PAGE_LIMIT, offset: 0 });
    return { ...data, search: "" };
  }

  const sorted = (allPokemon || []).sort((a, b) => extractIdFromUrl(a.url) - extractIdFromUrl(b.url));
  const details = await fetchPokemonDetails(sorted, request?.signal);

  return {
    pokemon: details,
    total: sorted.length,
    hasMore: false,
    search: "",
  };
}
