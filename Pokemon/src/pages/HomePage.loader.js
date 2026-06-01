import { getPokemonList, getPokemonByName, getPokemonById, getPokemonByType, getGeneration } from "../api/pokemonApi";
import { PAGE_LIMIT } from "../utils/constants";

function extractIdFromUrl(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, "").split("/");
  const id = parseInt(parts[parts.length - 1], 10);
  return Number.isFinite(id) ? id : null;
}

async function fetchPokemonDetails(pokemonList, signal) {
  const details = await Promise.all(
    pokemonList.map(async (p) => {
      try {
        const id = extractIdFromUrl(p.url);
        if (!id) return null;
        const detail = await getPokemonById(id, signal);
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
  return details.filter(Boolean);
}

export async function homeLoader({ request }) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const typeFilter = url.searchParams.get("type") || "";
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

  if (typeFilter && genFilter) {
    const [typePokemon, genData] = await Promise.all([
      getPokemonByType(typeFilter),
      getGeneration(genFilter),
    ]);
    const genNames = new Set((genData.pokemon_species || []).map((s) => s.name));
    const filtered = typePokemon.filter((p) => genNames.has(p.pokemon?.name || p.name));
    allPokemon = filtered.map((p) => ({
      name: p.pokemon?.name || p.name,
      url: p.pokemon?.url || "",
    }));
  } else if (typeFilter) {
    const typePokemon = await getPokemonByType(typeFilter);
    allPokemon = typePokemon.map((p) => ({
      name: p.pokemon?.name || p.name,
      url: p.pokemon?.url || "",
    }));
  } else if (genFilter) {
    const genData = await getGeneration(genFilter);
    allPokemon = (genData.pokemon_species || []).map((s) => ({
      name: s.name,
      url: s.url,
    }));
  } else {
    const data = await getPokemonList({ limit: PAGE_LIMIT, offset: 0 });
    return { ...data, search: "" };
  }

  const sorted = (allPokemon || []).sort((a, b) => extractIdFromUrl(a.url) - extractIdFromUrl(b.url));
  const details = await fetchPokemonDetails(sorted);

  return {
    pokemon: details,
    total: sorted.length,
    hasMore: false,
    search: "",
  };
}
