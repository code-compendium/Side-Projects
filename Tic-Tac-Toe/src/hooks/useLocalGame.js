import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { attachCharacters, CHARACTERS } from "../constants/characters";
import {
	FATALITY_KEYS,
	FATALITY_SEQUENCE_LENGTH,
	FATALITY_SECONDS,
	STORAGE_KEYS,
	TURN_SECONDS,
} from "../constants/game";
import {
	createEmptyBoard,
	createFatalityState,
	createPlayerState,
	createRandomFatalitySequence,
	getOppositeSymbol,
	calculateWinner,
	checkThreat,
	getInputBlockedByTarget,
} from "../lib/gameLogic";
import { useLocalStorageState } from "./useLocalStorageState";
import {
	enterSelectScreenAudio,
	playCardSelect,
	playFatalityFail,
	playFatalityStart,
	playFightClick,
	playHeavyStrike,
	playStrike,
	playWinner,
	startBattleMusic,
	startSelectMusic,
	stopBattleMusic,
	stopSelectMusic,
} from "../sounds";

function createPlayers() {
	return {
		X: createPlayerState({ symbol: "X", name: "", characterId: CHARACTERS[0].id }),
		O: createPlayerState({ symbol: "O", name: "", characterId: CHARACTERS[1].id }),
	};
}

export function useLocalGame({ enabled }) {
	const [screen, setScreen] = useState("select");
	const [transitionActive, setTransitionActive] = useState(false);
	const [boardFocusSignal, setBoardFocusSignal] = useState(0);
	const [players, setPlayers] = useState(createPlayers);
	const [board, setBoard] = useState(createEmptyBoard);
	const [currentTurn, setCurrentTurn] = useState("X");
	const [nextStarter, setNextStarter] = useState("X");
	const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
	const [fatality, setFatality] = useState(createFatalityState);
	const [shakeClass, setShakeClass] = useState("");
	const [scores, setScores] = useLocalStorageState(STORAGE_KEYS.scores, {
		X: 0,
		O: 0,
		draws: 0,
	});

	const timeoutRefs = useRef([]);

	const clearQueuedTimeouts = useCallback(() => {
		timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
		timeoutRefs.current = [];
	}, []);

	const queueTimeout = useCallback((callback, delay) => {
		const timeoutId = window.setTimeout(callback, delay);
		timeoutRefs.current.push(timeoutId);
		return timeoutId;
	}, []);

	const triggerShake = useCallback(
		(type) => {
			const duration = type === "shake-hard" ? 550 : 350;
			setShakeClass(type);
			queueTimeout(() => setShakeClass(""), duration);
		},
		[queueTimeout],
	);

	useEffect(() => {
		if (!enabled) {
			stopSelectMusic();
			stopBattleMusic();
			return;
		}

		if (screen === "select") {
			enterSelectScreenAudio();
			stopBattleMusic();
		} else {
			stopSelectMusic();
			startBattleMusic();
		}
	}, [enabled, screen]);

	useEffect(() => () => clearQueuedTimeouts(), [clearQueuedTimeouts]);

	const hydratedPlayers = useMemo(() => attachCharacters(players), [players]);
	const winnerSymbol = useMemo(() => calculateWinner(board), [board]);
	const currentPlayer = hydratedPlayers[currentTurn];
	const winnerPlayer = winnerSymbol ? hydratedPlayers[winnerSymbol] : null;
	const boardFilled = board.every((cell) => cell !== null);

	useEffect(() => {
		if (!enabled || screen !== "game" || fatality.active || winnerSymbol || boardFilled) return;

		const timeoutId = window.setTimeout(() => {
			if (timeLeft <= 1) {
				setCurrentTurn((turn) => getOppositeSymbol(turn));
				setTimeLeft(TURN_SECONDS);
				setBoardFocusSignal((previous) => previous + 1);
				return;
			}

			setTimeLeft((previous) => previous - 1);
		}, 1000);

		return () => window.clearTimeout(timeoutId);
	}, [boardFilled, enabled, fatality.active, screen, timeLeft, winnerSymbol]);

	useEffect(() => {
		if (!enabled || !fatality.active || fatality.result) return;

		const timeoutId = window.setTimeout(() => {
			setFatality((previous) => ({ ...previous, result: "fail" }));
			setNextStarter(getOppositeSymbol(fatality.winner));
			playFatalityFail();
			triggerShake("shake-normal");
			queueTimeout(() => {
				setBoard(createEmptyBoard());
				setCurrentTurn(getOppositeSymbol(fatality.winner));
				setTimeLeft(TURN_SECONDS);
				setFatality(createFatalityState());
				setBoardFocusSignal((previous) => previous + 1);
			}, 1600);
		}, FATALITY_SECONDS * 1000);

		return () => window.clearTimeout(timeoutId);
	}, [enabled, fatality, queueTimeout, triggerShake]);

	useEffect(() => {
		if (!enabled || !fatality.active || fatality.result) return;

		const handleKeyDown = (event) => {
			if (getInputBlockedByTarget(event.target)) return;
			if (!FATALITY_KEYS.includes(event.key)) return;

			event.preventDefault();
			const expectedKey = fatality.sequence[fatality.progress];

			if (event.key === expectedKey) {
				const nextProgress = fatality.progress + 1;
				if (nextProgress === fatality.sequence.length) {
					setFatality((previous) => ({ ...previous, result: "success" }));
					setScores((previous) => ({
						...previous,
						[fatality.winner]: previous[fatality.winner] + 1,
					}));
					setNextStarter(fatality.winner);
					playWinner();
					triggerShake("shake-hard");
				} else {
					setFatality((previous) => ({ ...previous, progress: nextProgress }));
				}
			} else {
				setFatality((previous) => ({ ...previous, result: "fail" }));
				setNextStarter(getOppositeSymbol(fatality.winner));
				playFatalityFail();
				triggerShake("shake-normal");
				queueTimeout(() => {
					setBoard(createEmptyBoard());
					setCurrentTurn(getOppositeSymbol(fatality.winner));
					setTimeLeft(TURN_SECONDS);
					setFatality(createFatalityState());
					setBoardFocusSignal((previous) => previous + 1);
				}, 1600);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, fatality, queueTimeout, setScores, triggerShake]);

	const setPlayerName = useCallback((symbol, name) => {
		setPlayers((previous) => ({
			...previous,
			[symbol]: {
				...previous[symbol],
				name,
			},
		}));
	}, []);

	const selectCharacter = useCallback((symbol, characterId) => {
		setPlayers((previous) => {
			if (previous[symbol].locked) return previous;

			const otherSymbol = getOppositeSymbol(symbol);
			const isTaken = previous[otherSymbol].locked && previous[otherSymbol].characterId === characterId;
			if (isTaken) return previous;

			playCardSelect();
			return {
				...previous,
				[symbol]: {
					...previous[symbol],
					characterId,
				},
			};
		});
	}, []);

	const toggleLock = useCallback((symbol) => {
		setPlayers((previous) => {
			const otherSymbol = getOppositeSymbol(symbol);
			const player = previous[symbol];
			if (!player.name.trim()) return previous;

			if (player.locked) {
				return {
					...previous,
					[symbol]: { ...player, locked: false },
				};
			}

			let nextPlayers = {
				...previous,
				[symbol]: { ...player, locked: true },
			};

			if (
				!nextPlayers[otherSymbol].locked &&
				nextPlayers[otherSymbol].characterId === nextPlayers[symbol].characterId
			) {
				const fallbackCharacter = CHARACTERS.find(
					(character) => character.id !== nextPlayers[symbol].characterId,
				);

				nextPlayers = {
					...nextPlayers,
					[otherSymbol]: {
						...nextPlayers[otherSymbol],
						characterId: fallbackCharacter.id,
					},
				};
			}

			return nextPlayers;
		});
	}, []);

	const startGame = useCallback(() => {
		if (!players.X.locked || !players.O.locked) return;
		playFightClick();
		clearQueuedTimeouts();
		setTransitionActive(true);
		setScreen("transition");
		queueTimeout(() => {
			setBoard(createEmptyBoard());
			setCurrentTurn("X");
			setNextStarter("X");
			setTimeLeft(TURN_SECONDS);
			setFatality(createFatalityState());
			setBoardFocusSignal((previous) => previous + 1);
			setScreen("game");
			queueTimeout(() => setTransitionActive(false), 100);
		}, 2000);
	}, [clearQueuedTimeouts, players, queueTimeout]);

	const playMove = useCallback(
		(index) => {
			if (screen !== "game" || fatality.active || board[index] || winnerSymbol) return;

			const nextBoard = board.slice();
			nextBoard[index] = currentTurn;

			const nextWinner = calculateWinner(nextBoard);
			const hasThreat = checkThreat(nextBoard);

			if (nextWinner || hasThreat) {
				playHeavyStrike();
				triggerShake("shake-hard");
			} else {
				playStrike();
				triggerShake("shake-normal");
			}

			setBoard(nextBoard);
			setTimeLeft(TURN_SECONDS);

			if (nextWinner) {
				playFatalityStart();
				setFatality({
					active: true,
					sequence: createRandomFatalitySequence(),
					progress: 0,
					winner: nextWinner,
					result: null,
				});
				return;
			}

			if (nextBoard.every((cell) => cell !== null)) {
				setScores((previous) => ({ ...previous, draws: previous.draws + 1 }));
				setNextStarter(getOppositeSymbol(currentTurn));
				return;
			}

			setCurrentTurn((previous) => getOppositeSymbol(previous));
		},
		[board, currentTurn, fatality.active, screen, setScores, triggerShake, winnerSymbol],
	);

	const resetBoard = useCallback(() => {
		setBoard(createEmptyBoard());
		setCurrentTurn(nextStarter);
		setTimeLeft(TURN_SECONDS);
		setFatality(createFatalityState());
		setBoardFocusSignal((previous) => previous + 1);
	}, [nextStarter]);

	const resetScores = useCallback(() => {
		if (!window.confirm("Reset all scores?")) return;
		setScores({ X: 0, O: 0, draws: 0 });
	}, [setScores]);

	const goToSelect = useCallback(() => {
		clearQueuedTimeouts();
		setTransitionActive(false);
		setScreen("select");
		setBoard(createEmptyBoard());
		setCurrentTurn("X");
		setNextStarter("X");
		setTimeLeft(TURN_SECONDS);
		setFatality(createFatalityState());
	}, [clearQueuedTimeouts]);

	const ensureSelectMusic = useCallback(() => {
		startSelectMusic();
	}, []);

	const statusText = useMemo(() => {
		if (fatality.active) {
			if (fatality.result === "success") {
				return `FATALITY! ${hydratedPlayers[fatality.winner].name.toUpperCase()} wins the round.`;
			}

			if (fatality.result === "fail") {
				return `${hydratedPlayers[fatality.winner].name} failed the fatality.`;
			}

			return `Finish the sequence, ${hydratedPlayers[fatality.winner].name}.`;
		}

		if (winnerSymbol) return `Winner: ${winnerPlayer.name}`;
		if (boardFilled) return "Draw. Reset the board for the next round.";
		return `Turn: ${currentPlayer.name || currentTurn} (${currentTurn})`;
	}, [boardFilled, currentPlayer.name, currentTurn, fatality, hydratedPlayers, winnerPlayer, winnerSymbol]);

	const statusColor = fatality.active
		? "#ff5c5c"
		: winnerPlayer?.character.color ?? currentPlayer.character.color;
	const canContinueRound =
		(fatality.active && fatality.result === "success") || (!fatality.active && (winnerSymbol || boardFilled));

	return {
		screen: screen === "transition" ? "select" : screen,
		transitionActive,
		players: hydratedPlayers,
		scoreboardPlayers: hydratedPlayers,
		board,
		timeLeft,
		showTimer: screen === "game" && !fatality.active && !winnerSymbol && !boardFilled,
		statusText,
		statusColor,
		canContinueRound,
		canStart: players.X.locked && players.O.locked,
		fatality,
		boardFocusSignal,
		boardLocked: fatality.active,
		shakeClass,
		scores,
		setPlayerName,
		selectCharacter,
		toggleLock,
		startGame,
		playMove,
		continueRound: resetBoard,
		resetBoard,
		resetScores,
		goToSelect,
		ensureSelectMusic,
	};
}
