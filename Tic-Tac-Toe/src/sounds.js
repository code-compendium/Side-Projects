// sounds.js - Beheert de audio voor TicTacKombat
import selectMusicUrl from "./assets/sounds/Tic-Tac-Kombat_BG.mp3";
import cardHoverUrl from "./assets/sounds/Card_Hover.mp3";
import chooseYourFighterUrl from "./assets/sounds/Choose_Your_Fighter.mp3";
import fightStartUrl from "./assets/sounds/Fight_Start.mp3";
import fatalityUrl from "./assets/sounds/Fatality.mp3";
import failUrl from "./assets/sounds/Fail.mp3";
import strikeUrl from "./assets/sounds/Strike.mp3";
import heavyStrikeUrl from "./assets/sounds/Heavy_Strike.mp3";
import cardSelectUrl from "./assets/sounds/Card_Select.mp3";
import kombatBgUrl from "./assets/sounds/Kombat_BG.mp3";
import koUrl from "./assets/sounds/KO.mp3";

let backgroundMusic = null;
let battleMusic = null;

let hoverAudio = null;

/**
 * Helper om een geluidseffect af te spelen.
 */
function playEffect(url, volume = 0.5, restartIfPlaying = false) {
	if (restartIfPlaying && hoverAudio) {
		hoverAudio.pause();
		hoverAudio.currentTime = 0;
	}

	const audio = new Audio(url);
	audio.volume = volume;

	if (restartIfPlaying) hoverAudio = audio;

	audio.play().catch((e) => console.log("Audio play blocked/failed:", e));
}

// ============================================================
// ACHTERGROND MUZIEK
// ============================================================

export function startSelectMusic() {
	if (backgroundMusic) stopSelectMusic();
	backgroundMusic = new Audio(selectMusicUrl);
	backgroundMusic.loop = true;
	backgroundMusic.volume = 0.25;
	backgroundMusic.play().catch(() => {
		const retry = () => {
			backgroundMusic?.play();
			window.removeEventListener("click", retry);
		};
		window.addEventListener("click", retry);
	});
}

export function stopSelectMusic() {
	if (backgroundMusic) {
		backgroundMusic.pause();
		backgroundMusic.currentTime = 0;
		backgroundMusic = null;
	}
}

export function startBattleMusic(url) {
	if (battleMusic) stopBattleMusic();
	// Battle muziek
	battleMusic = new Audio(url || kombatBgUrl);
	battleMusic.loop = true;
	battleMusic.volume = 0.15; // Zacht op de achtergrond
	battleMusic.play().catch(() => {});
}

export function stopBattleMusic() {
	if (battleMusic) {
		battleMusic.pause();
		battleMusic = null;
	}
}

// ============================================================
// GELUIDSEFFECTEN
// ============================================================

// Choose your fighter stem
export function playChooseYourFighter() {
	const audio = new Audio(chooseYourFighterUrl);
	audio.volume = 0.8;
	audio.play().catch(() => {
		// Browser blokkeert autoplay, wacht op de eerste interactie!
		const retry = () => {
			audio.play();
			window.removeEventListener("click", retry);
		};
		window.addEventListener("click", retry);
	});
}

// Hover over character kaart
export function playCardHover() {
	playEffect(cardHoverUrl, 0.2, true);
}

// Aanklikken van een character
export function playCardSelect() {
	playEffect(cardSelectUrl, 0.5);
}

// Lock character
export function playLock() {
	playEffect(heavyStrikeUrl, 0.6);
}

// Unlock character
export function playUnlock() {
	playEffect(strikeUrl, 0.4);
}

// Klikken op "Fight"
export function playFightClick() {
	playEffect(fightStartUrl, 0.7);
}

// Strike (normaal)
export function playStrike() {
	playEffect(strikeUrl, 0.5);
}

// Strike (zwaar/dreiging)
export function playHeavyStrike() {
	playEffect(heavyStrikeUrl, 0.7);
}

// Start van de fatality sequence
export function playFatalityStart() {
	playEffect(fatalityUrl, 0.7);
}

// Fatality succes / Winnaar
export function playWinner() {
	playEffect(koUrl, 0.8);
}

// Fatality faal
export function playFatalityFail() {
	playEffect(failUrl, 0.6);
}
