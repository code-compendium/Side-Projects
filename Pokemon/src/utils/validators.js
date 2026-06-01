export function sanitizeSearch(input) {
  if (typeof input !== "string") return "";
  const trimmed = input.trim().slice(0, 20);
  return trimmed.replace(/[^a-zA-Z\s-]/g, "");
}

export function isValidPokemonId(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }
  return Number.isInteger(value) && value > 0;
}

export function validatePokemonName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Pokemon name must be a non-empty string");
  }
  const sanitized = sanitizeSearch(name);
  if (sanitized.length === 0) {
    throw new Error("Pokemon name contains no valid characters");
  }
  return sanitized.toLowerCase();
}
