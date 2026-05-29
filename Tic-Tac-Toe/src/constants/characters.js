import imgScorpion from "../assets/images/Scorpion_Insp.png";
import imgSubZero from "../assets/images/Sub-Zero_Insp.png";
import imgKitana from "../assets/images/Kitana_Insp.png";
import imgSonya from "../assets/images/Sonya_Insp.png";
import imgShaoKahn from "../assets/images/Shao-Kahn_Insp.png";
import imgRaiden from "../assets/images/Raiden_Insp.png";

export const CHARACTERS = [
	{ id: "scorpion", name: "Scorpion", color: "#ffcc00", shadow: "#ff6600", img: imgScorpion },
	{ id: "sub-zero", name: "Sub-Zero", color: "#00ccff", shadow: "#0033ff", img: imgSubZero },
	{ id: "kitana", name: "Kitana", color: "#3366ff", shadow: "#000099", img: imgKitana },
	{ id: "sonya", name: "Sonya", color: "#33cc33", shadow: "#006600", img: imgSonya },
	{ id: "shao-kahn", name: "Shao Kahn", color: "#ff3300", shadow: "#660000", img: imgShaoKahn },
	{ id: "raiden", name: "Raiden", color: "#ffffff", shadow: "#00ffff", img: imgRaiden },
];

export function getCharacterById(characterId) {
	return CHARACTERS.find((character) => character.id === characterId) ?? CHARACTERS[0];
}

export function attachCharacter(player) {
	return {
		...player,
		character: getCharacterById(player.characterId),
	};
}

export function attachCharacters(players) {
	return {
		X: attachCharacter(players.X),
		O: attachCharacter(players.O),
	};
}
