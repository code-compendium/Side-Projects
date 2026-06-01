import { getPokemonById, getPokemonSpecies, getEvolutionChain } from "../api/pokemonApi";

function extractIdFromUrl(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

function parseBranchedEvolution(chain) {
  if (!chain?.species?.name) return [];

  const groups = [];
  let currentGroup = [];

  function traverse(node, depth = 0) {
    if (!node?.species?.name) return;

    if (currentGroup.length > 0 && depth !== currentGroup[0].depth) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }

    const id = extractIdFromUrl(node.species.url);
    currentGroup.push({ name: node.species.name, id, depth });
    currentGroup.sort((a, b) => a.name.localeCompare(b.name));

    if (node.evolves_to && Array.isArray(node.evolves_to)) {
      node.evolves_to.forEach((child) => traverse(child, depth + 1));
    }
  }

  traverse(chain);
  if (currentGroup.length > 0) {
    groups.push([...currentGroup]);
  }

  return groups;
}

export async function detailLoader({ params }) {
  const { id } = params;
  if (!id) throw new Error("Pokemon ID is required");

  const pokemon = await getPokemonById(id);
  const speciesId = extractIdFromUrl(pokemon.species?.url) || id;
  const species = await getPokemonSpecies(speciesId);

  let evolutionGroups = [];
  if (species.evolution_chain?.url) {
    const chain = await getEvolutionChain(species.evolution_chain.url);
    evolutionGroups = parseBranchedEvolution(chain);
  }

  const flavorTextEntry = (species.flavor_text_entries || []).find(
    (entry) => entry.language?.name === "en"
  );
  const flavorText = flavorTextEntry
    ? flavorTextEntry.flavor_text?.replace(/[\n\f\r]/g, " ") || null
    : null;

  const flavorTextNlEntry = (species.flavor_text_entries || []).find(
    (entry) => entry.language?.name === "nl"
  );
  const flavorTextNl = flavorTextNlEntry
    ? flavorTextNlEntry.flavor_text?.replace(/[\n\f\r]/g, " ") || null
    : null;

  return {
    pokemon,
    species,
    evolutionGroups,
    flavorText,
    flavorTextNl,
  };
}
