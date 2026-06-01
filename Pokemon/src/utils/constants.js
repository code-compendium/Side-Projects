export const API_BASE_URL = "https://pokeapi.co/api/v2";
export const PAGE_LIMIT = 20;

export const TYPE_COLORS = {
  normal: { bg: "#A8A878", text: "#000" },
  fire: { bg: "#F08030", text: "#000" },
  water: { bg: "#6890F0", text: "#000" },
  electric: { bg: "#F8D030", text: "#000" },
  grass: { bg: "#78C850", text: "#000" },
  ice: { bg: "#98D8D8", text: "#000" },
  fighting: { bg: "#C03028", text: "#FFF" },
  poison: { bg: "#A040A0", text: "#FFF" },
  ground: { bg: "#E0C068", text: "#000" },
  flying: { bg: "#A890F0", text: "#000" },
  psychic: { bg: "#F85888", text: "#000" },
  bug: { bg: "#A8B820", text: "#000" },
  rock: { bg: "#B8A038", text: "#000" },
  ghost: { bg: "#705898", text: "#FFF" },
  dragon: { bg: "#7038F8", text: "#FFF" },
  dark: { bg: "#705848", text: "#FFF" },
  steel: { bg: "#B8B8D0", text: "#000" },
  fairy: { bg: "#EE99AC", text: "#000" },
};

export const STAT_NAMES = {
  nl: {
    hp: "HP",
    attack: "Aanval",
    defense: "Verdediging",
    "special-attack": "Sp. Aanval",
    "special-defense": "Sp. Verdediging",
    speed: "Snelheid",
  },
  en: {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  },
};

export const GENERATIONS = [
  { id: 1, name: "Generation I", games: "Red/Blue/Yellow" },
  { id: 2, name: "Generation II", games: "Gold/Silver/Crystal" },
  { id: 3, name: "Generation III", games: "Ruby/Sapphire/Emerald" },
  { id: 4, name: "Generation IV", games: "Diamond/Pearl/Platinum" },
  { id: 5, name: "Generation V", games: "Black/White" },
  { id: 6, name: "Generation VI", games: "X/Y" },
  { id: 7, name: "Generation VII", games: "Sun/Moon" },
  { id: 8, name: "Generation VIII", games: "Sword/Shield" },
  { id: 9, name: "Generation IX", games: "Scarlet/Violet" },
];

export const BERRY_FLAVOR_COLORS = {
  spicy: "#E53935",
  dry: "#FB8C00",
  sweet: "#FDD835",
  bitter: "#43A047",
  sour: "#1E88E5",
};
