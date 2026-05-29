export const TURN_SECONDS = 10;
export const FATALITY_SECONDS = 10;
export const FATALITY_SEQUENCE_LENGTH = 10;
export const FATALITY_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
export const KEY_LABELS = {
	ArrowUp: "UP",
	ArrowDown: "DOWN",
	ArrowLeft: "LEFT",
	ArrowRight: "RIGHT",
};

export const STORAGE_KEYS = {
	scores: "mk_tictactoe_scores",
};

export const WIN_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];
