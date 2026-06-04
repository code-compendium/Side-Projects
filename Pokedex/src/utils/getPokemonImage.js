export function getPokemonImage(sprites) {
  return (
    sprites.other?.["official-artwork"]?.front_default ??
    sprites.front_default ??
    null
  );
}
