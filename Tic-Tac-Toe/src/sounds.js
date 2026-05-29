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
let audioUnlocked = false;
let listenersAttached = false;
const pendingActions = new Set();
let selectScreenIntroQueued = false;

function queueAfterUnlock(action) {
	pendingActions.add(action);

	if (listenersAttached) return;
	listenersAttached = true;

	const unlockAudio = () => {
		audioUnlocked = true;
		listenersAttached = false;
		window.removeEventListener("pointerdown", unlockAudio);
		window.removeEventListener("keydown", unlockAudio);

		const queuedActions = Array.from(pendingActions);
		pendingActions.clear();
		queuedActions.forEach((queuedAction) => queuedAction());
	};

	window.addEventListener("pointerdown", unlockAudio, { once: true });
	window.addEventListener("keydown", unlockAudio, { once: true });
}

function removeQueuedAction(action) {
	pendingActions.delete(action);
}

function safePlay(audio, onBlocked) {
	try {
		const playPromise = audio.play();
		playPromise?.catch(() => {
			if (onBlocked) queueAfterUnlock(onBlocked);
		});
	} catch {
		if (onBlocked) queueAfterUnlock(onBlocked);
	}
}

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

	safePlay(audio);
}

// ============================================================
// ACHTERGROND MUZIEK
// ============================================================

export function startSelectMusic() {
	if (!backgroundMusic) {
		backgroundMusic = new Audio(selectMusicUrl);
		backgroundMusic.loop = true;
	}

	backgroundMusic.volume = 0.25;
	removeQueuedAction(resumeBattleMusic);
	resumeSelectMusic();

	if (!audioUnlocked) {
		queueAfterUnlock(resumeSelectMusic);
	}
}

export function stopSelectMusic() {
	if (backgroundMusic) {
		removeQueuedAction(resumeSelectMusic);
		backgroundMusic.pause();
		backgroundMusic.currentTime = 0;
	}
}

export function startBattleMusic(url) {
	if (!battleMusic || (url && battleMusic.src !== new URL(url, window.location.href).href)) {
		battleMusic = new Audio(url || kombatBgUrl);
		battleMusic.loop = true;
	}

	battleMusic.volume = 0.15;
	removeQueuedAction(resumeSelectMusic);
	resumeBattleMusic();

	if (!audioUnlocked) {
		queueAfterUnlock(resumeBattleMusic);
	}
}

export function stopBattleMusic() {
	if (battleMusic) {
		removeQueuedAction(resumeBattleMusic);
		battleMusic.pause();
		battleMusic.currentTime = 0;
	}
}

function resumeSelectMusic() {
	if (!backgroundMusic) return;
	safePlay(backgroundMusic, resumeSelectMusic);
}

function resumeBattleMusic() {
	if (!battleMusic) return;
	safePlay(battleMusic, resumeBattleMusic);
}

function playChooseYourFighterNow() {
	const audio = new Audio(chooseYourFighterUrl);
	audio.volume = 0.8;
	safePlay(audio);
}

export function armSelectMusic() {
	if (!backgroundMusic) {
		backgroundMusic = new Audio(selectMusicUrl);
		backgroundMusic.loop = true;
		backgroundMusic.volume = 0.25;
	}

	if (audioUnlocked) {
		resumeSelectMusic();
		return;
	}

	queueAfterUnlock(resumeSelectMusic);
}

export function enterSelectScreenAudio() {
	if (!backgroundMusic) {
		backgroundMusic = new Audio(selectMusicUrl);
		backgroundMusic.loop = true;
		backgroundMusic.volume = 0.25;
	}

	if (audioUnlocked) {
		resumeSelectMusic();
		playChooseYourFighterNow();
		return;
	}

	if (selectScreenIntroQueued) return;
	selectScreenIntroQueued = true;

	queueAfterUnlock(() => {
		selectScreenIntroQueued = false;
		resumeSelectMusic();
		playChooseYourFighterNow();
	});
}

// ============================================================
// GELUIDSEFFECTEN
// ============================================================

// Choose your fighter stem
export function playChooseYourFighter() {
	enterSelectScreenAudio();
}

// Hover over character kaart
export function playCardHover() {
	playEffect(cardHoverUrl, 0.2, true);
}

// Aanklikken van een character
export function playCardSelect() {
	playEffect(cardSelectUrl, 1);
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
