import { getBerry, fetchWithGuard } from "../api/pokemonApi";

export async function berryDetailLoader({ params }) {
  const { id } = params;
  if (!id) throw new Error("Berry ID is required");

  const berry = await getBerry(id);

  if (!berry || !berry.name) {
    throw new Error("Berry not found");
  }

  let item = null;
  if (berry.item?.url) {
    try {
      item = await fetchWithGuard(berry.item.url);
    } catch {
      item = null;
    }
  }

  return { berry, item };
}
