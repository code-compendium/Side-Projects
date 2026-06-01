import { getBerryList } from "../api/pokemonApi";
import { PAGE_LIMIT } from "../utils/constants";

export async function berriesLoader({ request }) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const offsetParam = url.searchParams.get("offset");
  const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0;

  const data = await getBerryList({ limit: PAGE_LIMIT, offset });

  let berries = data.berries;

  if (search) {
    berries = berries.filter((b) => b.name.includes(search));
  }

  return {
    berries,
    total: data.total,
    hasMore: data.hasMore && !search,
    search,
  };
}
