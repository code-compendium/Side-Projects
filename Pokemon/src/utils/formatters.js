export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatId(id) {
  return `#${String(id).padStart(4, "0")}`;
}

export function formatHeight(dm) {
  if (dm == null) return "—";
  const totalInches = dm * 0.3937;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${dm / 10} m (${feet}'${inches}")`;
}

export function formatWeight(hg) {
  if (hg == null) return "—";
  const lbs = (hg * 0.220462).toFixed(1);
  return `${hg / 10} kg (${lbs} lbs)`;
}

export function formatStatName(statKey, lang = "en") {
  const names = {
    en: {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      "special-attack": "Sp. Atk",
      "special-defense": "Sp. Def",
      speed: "Speed",
    },
    nl: {
      hp: "HP",
      attack: "Aanval",
      defense: "Verdediging",
      "special-attack": "Sp. Aanval",
      "special-defense": "Sp. Verdediging",
      speed: "Snelheid",
    },
  };
  return names[lang]?.[statKey] || statKey;
}
