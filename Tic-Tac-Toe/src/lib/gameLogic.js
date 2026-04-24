import {
	FATALITY_KEYS,
	FATALITY_SEQUENCE_LENGTH,
	WIN_LINES,
} from "../constants/game";

export function createEmptyBoard() {
	return Array(9).fill(null);
}

export function createFatalityState() {
	return {
		active: false,
		sequence: [],
		progress: 0,
		winner: null,
		result: null,
	};
}

export function createPlayerState({ symbol, name, characterId, isHost = false }) {
	return {
		id: symbol,
		symbol,
		name,
		characterId,
		locked: false,
		connected: true,
		isHost,
	};
}

export function createRandomFatalitySequence() {
	return Array.from(
		{ length: FATALITY_SEQUENCE_LENGTH },
		() => FATALITY_KEYS[Math.floor(Math.random() * FATALITY_KEYS.length)],
	);
}

export function getOppositeSymbol(symbol) {
	return symbol === "X" ? "O" : "X";
}

export function calculateWinner(board) {
	for (const [a, b, c] of WIN_LINES) {
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a];
		}
	}

	return null;
}

export function checkThreat(board) {
	for (const [a, b, c] of WIN_LINES) {
		const values = [board[a], board[b], board[c]];
		const xCount = values.filter((value) => value === "X").length;
		const oCount = values.filter((value) => value === "O").length;
		const emptyCount = values.filter((value) => value === null).length;

		if ((xCount === 2 || oCount === 2) && emptyCount === 1) {
			return true;
		}
	}

	return false;
}

export function getCellAriaLabel(index, value) {
	const row = Math.floor(index / 3) + 1;
	const column = (index % 3) + 1;
	return value
		? `Row ${row}, column ${column}, occupied by ${value}`
		: `Row ${row}, column ${column}, empty`;
}

export function getInputBlockedByTarget(target) {
	if (!(target instanceof HTMLElement)) return false;

	return (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.tagName === "SELECT" ||
		target.isContentEditable
	);
}

export function resolveSocketUrl() {
	const configuredUrl = import.meta.env.VITE_WS_URL;
	if (configuredUrl) return configuredUrl;

	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
		return `${protocol}//${window.location.hostname}:3001`;
	}

	return `${protocol}//${window.location.host}`;
}
