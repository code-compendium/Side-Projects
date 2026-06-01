import { getLocation, getLocationArea } from "../api/pokemonApi";

function extractIdFromUrl(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

export async function locationDetailLoader({ params }) {
  const { id } = params;
  if (!id) throw new Error("Location ID is required");

  const location = await getLocation(id);

  if (!location || !location.name) {
    throw new Error("Location not found");
  }

  const areaEncounters = await Promise.all(
    (location.areas || []).map(async (area) => {
      try {
        const pokemon = await getLocationArea(area.url);
        return {
          areaName: area.name,
          pokemon: pokemon.map((p) => ({
            name: p.name,
            id: extractIdFromUrl(p.url),
          })),
        };
      } catch {
        return { areaName: area.name, pokemon: [] };
      }
    })
  );

  return { location, areaEncounters };
}
