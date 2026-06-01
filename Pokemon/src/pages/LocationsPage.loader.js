import { getRegionList } from "../api/pokemonApi";

const REGION_ORDER = ["kanto","johto","hoenn","sinnoh","unova","kalos","alola","galar","paldea"];

export async function locationsLoader() {
  const results = await getRegionList();
  const regions = results
    .filter((r) => REGION_ORDER.includes(r.name))
    .sort((a, b) => REGION_ORDER.indexOf(a.name) - REGION_ORDER.indexOf(b.name))
    .map((r) => ({ name: r.name }));
  return { regions };
}
