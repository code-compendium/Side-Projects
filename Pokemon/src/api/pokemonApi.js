import { API_BASE_URL } from "../utils/constants";
import { isValidPokemonId, validatePokemonName } from "../utils/validators";

export async function fetchWithGuard(url, options = {}) {
  if (!url || typeof url !== "string") {
    throw new Error("fetchWithGuard: URL is required");
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("Not found");
    if (res.status >= 500) throw new Error("Server error");
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  if (data === null || data === undefined) {
    throw new Error("fetchWithGuard: empty response body");
  }

  return data;
}

export async function getPokemonList({ limit = 20, offset = 0, signal } = {}) {
  if (typeof limit !== "number" || limit < 1) limit = 20;
  if (typeof offset !== "number" || offset < 0) offset = 0;

  const data = await fetchWithGuard(
    `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    { signal }
  );

  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing results array");
  }

  const details = await Promise.all(
    data.results.map(async (pokemon) => {
      if (!pokemon?.url) return null;
      try {
        const detail = await fetchWithGuard(pokemon.url, { signal });
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

  return {
    pokemon: details.filter(Boolean),
    total: data.count || 0,
    hasMore: offset + limit < (data.count || 0),
  };
}

export async function getPokemonByName(name, signal) {
  const sanitized = validatePokemonName(name);

  const data = await fetchWithGuard(
    `${API_BASE_URL}/pokemon/${sanitized}`,
    { signal }
  );

  return {
    name: data.name,
    id: data.id,
    image: data.sprites?.front_default || null,
    types: (data.types || []).map((t) => t.type?.name).filter(Boolean),
  };
}

export async function getPokemonById(id, signal) {
  if (!isValidPokemonId(id)) {
    throw new Error(`getPokemonById: invalid pokemon ID "${id}"`);
  }

  const numericId = Number(id);
  const data = await fetchWithGuard(
    `${API_BASE_URL}/pokemon/${numericId}`,
    { signal }
  );

  if (!data.name) throw new Error("Invalid pokemon data: missing name");

  return data;
}

export async function getPokemonSpecies(id, signal) {
  if (!isValidPokemonId(id)) {
    throw new Error(`getPokemonSpecies: invalid pokemon ID "${id}"`);
  }

  const data = await fetchWithGuard(
    `${API_BASE_URL}/pokemon-species/${Number(id)}`,
    { signal }
  );

  return data;
}

export async function getEvolutionChain(url, signal) {
  if (!url || typeof url !== "string") {
    throw new Error("getEvolutionChain: evolution chain URL is required");
  }

  const data = await fetchWithGuard(url, { signal });

  if (!data.chain) throw new Error("Invalid evolution data: missing chain");

  return data.chain;
}

export async function getGenerationList(signal) {
  const data = await fetchWithGuard(`${API_BASE_URL}/generation`, { signal });
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing generation results");
  }
  return data.results;
}

export async function getGeneration(id, signal) {
  const data = await fetchWithGuard(
    `${API_BASE_URL}/generation/${id}`,
    { signal }
  );
  if (!data.pokemon_species || !Array.isArray(data.pokemon_species)) {
    throw new Error("Invalid response: missing pokemon species in generation");
  }
  return data;
}

export async function getTypeList(signal) {
  const data = await fetchWithGuard(`${API_BASE_URL}/type`, { signal });
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing type results");
  }
  return data.results.filter((t) => !t.name.includes("unknown") && !t.name.includes("shadow"));
}

export async function getPokemonByType(type, signal) {
  const data = await fetchWithGuard(
    `${API_BASE_URL}/type/${type}`,
    { signal }
  );
  if (!data.pokemon || !Array.isArray(data.pokemon)) {
    throw new Error("Invalid response: missing pokemon array in type");
  }
  return data.pokemon.map((p) => ({
    name: p.pokemon?.name || "",
    url: p.pokemon?.url || "",
  })).filter((p) => p.name);
}

export async function getRegionList(signal) {
  const data = await fetchWithGuard(`${API_BASE_URL}/region`, { signal });
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing region results");
  }
  return data.results;
}

export async function getRegion(id, signal) {
  const data = await fetchWithGuard(
    `${API_BASE_URL}/region/${id}`,
    { signal }
  );
  if (!data.locations || !Array.isArray(data.locations)) {
    return [];
  }
  return data.locations;
}

export async function getLocationList({ limit = 20, offset = 0, signal } = {}) {
  if (typeof limit !== "number" || limit < 1) limit = 20;
  if (typeof offset !== "number" || offset < 0) offset = 0;

  const data = await fetchWithGuard(
    `${API_BASE_URL}/location?limit=${limit}&offset=${offset}`,
    { signal }
  );

  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing location results");
  }

  return {
    locations: data.results,
    total: data.count || 0,
    hasMore: offset + limit < (data.count || 0),
  };
}

export async function getLocation(id, signal) {
  const data = await fetchWithGuard(
    `${API_BASE_URL}/location/${id}`,
    { signal }
  );
  return data;
}

export async function getLocationArea(url, signal) {
  if (!url) throw new Error("getLocationArea: URL is required");

  const data = await fetchWithGuard(url, { signal });

  if (!data.pokemon_encounters || !Array.isArray(data.pokemon_encounters)) {
    return [];
  }

  return data.pokemon_encounters.map((encounter) => ({
    name: encounter.pokemon?.name || "",
    url: encounter.pokemon?.url || "",
  })).filter((e) => e.name);
}

export async function getBerryList({ limit = 20, offset = 0, signal } = {}) {
  if (typeof limit !== "number" || limit < 1) limit = 20;
  if (typeof offset !== "number" || offset < 0) offset = 0;

  const data = await fetchWithGuard(
    `${API_BASE_URL}/berry?limit=${limit}&offset=${offset}`,
    { signal }
  );

  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Invalid response: missing berry results");
  }

  return {
    berries: data.results,
    total: data.count || 0,
    hasMore: offset + limit < (data.count || 0),
  };
}

export async function getBerry(id, signal) {
  const data = await fetchWithGuard(
    `${API_BASE_URL}/berry/${id}`,
    { signal }
  );
  return data;
}
