const API_BASE_URL = "https://pokeapi.co/api/v2";

export async function getPokemonList() {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=20`);

  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon list");
  }
  return response.json();
}

export { API_BASE_URL };
