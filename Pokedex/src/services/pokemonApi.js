const BASE_URL = "https://pokeapi.co/api/v2";

export async function getPokemonList(limit = 20) {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    return data.results;
  } catch (error) {
    throw new Error(error.message || "Unknown fetch error", { cause: error });
  }
}

export async function getPokemonDetails(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error("Error fetching details", { cause: error });
  }
}
