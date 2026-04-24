import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { attachCharacters } from "../constants/characters";
import { FATALITY_KEYS } from "../constants/game";
import {
	calculateWinner,
	checkThreat,
	getInputBlockedByTarget,
	resolveSocketUrl,
} from "../lib/gameLogic";
import {
	enterSelectScreenAudio,
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

export function useOnlineGame({ enabled, initialRoomId }) {
	const socketRef = useRef(null);
	const queueRef = useRef([]);
	const attemptedAutoJoinRef = useRef(false);
	const previousBoardRef = useRef(null);
	const previousStatusRef = useRef("");
	const previousFatalityResultRef = useRef(null);
	const previousBoardFocusSignatureRef = useRef("");
	const shakeTimeoutRef = useRef(null);

	const [connectionStatus, setConnectionStatus] = useState("idle");
	const [error, setError] = useState("");
	const [room, setRoom] = useState(null);
	const [self, setSelf] = useState(null);
	const [shakeClass, setShakeClass] = useState("");
	const [boardFocusSignal, setBoardFocusSignal] = useState(0);

	const triggerShake = useCallback((type) => {
		window.clearTimeout(shakeTimeoutRef.current);
		setShakeClass(type);
		shakeTimeoutRef.current = window.setTimeout(() => setShakeClass(""), type === "shake-hard" ? 550 : 350);
	}, []);

	const cleanupSocket = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}
		queueRef.current = [];
	}, []);

	const sendQueuedMessages = useCallback(() => {
		const socket = socketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) return;

		queueRef.current.forEach((message) => {
			socket.send(JSON.stringify(message));
		});
		queueRef.current = [];
	}, []);

	const openSocket = useCallback(() => {
		if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) {
			return socketRef.current;
		}

		const socket = new WebSocket(resolveSocketUrl());
		socketRef.current = socket;
		setConnectionStatus("connecting");

		socket.addEventListener("open", () => {
			setConnectionStatus("connected");
			sendQueuedMessages();
		});

		socket.addEventListener("message", (event) => {
			const data = JSON.parse(event.data);

			if (data.type === "ROOM_STATE") {
				const incomingRoom = data.room;
				const shouldFocusBoard =
					incomingRoom.status === "playing" && incomingRoom.board.every((cell) => cell === null);
				const focusSignature = shouldFocusBoard
					? `${incomingRoom.status}:${incomingRoom.currentTurn}:${incomingRoom.scores.X}:${incomingRoom.scores.O}:${incomingRoom.scores.draws}`
					: "";

				if (focusSignature && previousBoardFocusSignatureRef.current !== focusSignature) {
					previousBoardFocusSignatureRef.current = focusSignature;
					setBoardFocusSignal((previous) => previous + 1);
				} else if (!focusSignature) {
					previousBoardFocusSignatureRef.current = "";
				}

				setRoom(data.room);
				setSelf(data.self);
				setError("");
				return;
			}

			if (data.type === "ERROR") {
				setError(data.message);
			}
		});

		socket.addEventListener("close", () => {
			setConnectionStatus("disconnected");
		});

		socket.addEventListener("error", () => {
			setError("Could not connect to the room server.");
		});

		return socket;
	}, [sendQueuedMessages]);

	const sendMessage = useCallback(
		(message) => {
			const socket = openSocket();
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(message));
			} else {
				queueRef.current.push(message);
			}
		},
		[openSocket],
	);

	useEffect(() => {
		if (!enabled) {
			stopSelectMusic();
			stopBattleMusic();
			cleanupSocket();
			return;
		}

		if (initialRoomId && !attemptedAutoJoinRef.current) {
			attemptedAutoJoinRef.current = true;
			window.setTimeout(() => {
				sendMessage({ type: "JOIN_ROOM", roomId: initialRoomId });
			}, 0);
		}

		return () => {
			stopSelectMusic();
			stopBattleMusic();
		};
	}, [cleanupSocket, enabled, initialRoomId, sendMessage]);

	useEffect(() => {
		if (!enabled) return;

		const status = room?.status ?? "idle";
		if (status === "lobby" || status === "idle") {
			enterSelectScreenAudio();
			stopBattleMusic();
		} else {
			stopSelectMusic();
			startBattleMusic();
		}
	}, [enabled, room?.status]);

	useEffect(() => {
		if (!enabled || !room) return;

		const previousStatus = previousStatusRef.current;
		const currentStatus = room.status;

		if (previousStatus !== currentStatus) {
			if (currentStatus === "transition") {
				playFightClick();
			}

			if (currentStatus === "fatality") {
				playFatalityStart();
			}
		}

		previousStatusRef.current = currentStatus;
	}, [enabled, room]);

	useEffect(() => {
		if (!enabled || !room) return;

		const previousBoard = previousBoardRef.current;
		const nextBoard = room.board;

		if (
			previousBoard &&
			previousBoard.join("") !== nextBoard.join("") &&
			nextBoard.filter(Boolean).length > previousBoard.filter(Boolean).length
		) {
			const winner = calculateWinner(nextBoard);
			const hasThreat = checkThreat(nextBoard);

			if (winner || hasThreat) {
				playHeavyStrike();
				window.setTimeout(() => triggerShake("shake-hard"), 0);
			} else {
				playStrike();
				window.setTimeout(() => triggerShake("shake-normal"), 0);
			}
		}

		previousBoardRef.current = nextBoard;
	}, [enabled, room, triggerShake]);

	useEffect(() => {
		if (!enabled || !room?.fatality) return;

		const previousResult = previousFatalityResultRef.current;
		if (previousResult !== room.fatality.result) {
			if (room.fatality.result === "success") {
				playWinner();
				window.setTimeout(() => triggerShake("shake-hard"), 0);
			}

			if (room.fatality.result === "fail") {
				playFatalityFail();
				window.setTimeout(() => triggerShake("shake-normal"), 0);
			}
		}

		previousFatalityResultRef.current = room.fatality.result;
	}, [enabled, room, triggerShake]);

	useEffect(() => {
		if (!enabled || !room?.fatality?.active || room.fatality.result || self?.symbol !== room.fatality.winner) {
			return;
		}

		const handleKeyDown = (event) => {
			if (getInputBlockedByTarget(event.target)) return;
			if (!FATALITY_KEYS.includes(event.key)) return;
			event.preventDefault();
			sendMessage({ type: "FATALITY_INPUT", key: event.key });
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, room, self, sendMessage]);

	useEffect(
		() => () => {
			window.clearTimeout(shakeTimeoutRef.current);
			cleanupSocket();
		},
		[cleanupSocket],
	);

	const players = useMemo(() => (room ? attachCharacters(room.players) : null), [room]);
	const localSymbol = self?.symbol ?? null;
	const isHost = self?.symbol === "X";
	const roomId = room?.id ?? "";
	const canStartMatch =
		room?.status === "lobby" &&
		room.players.X.connected &&
		room.players.O.connected &&
		room.players.X.locked &&
		room.players.O.locked;
	const canPlayBoard = room?.status === "playing" && localSymbol === room.currentTurn;
	const canContinueRound = room?.status === "round_end" && isHost;

	const createRoom = useCallback(() => {
		attemptedAutoJoinRef.current = true;
		sendMessage({ type: "CREATE_ROOM" });
	}, [sendMessage]);

	const joinRoom = useCallback(
		joinRoomId => {
			if (!joinRoomId.trim()) return;
			attemptedAutoJoinRef.current = true;
			sendMessage({ type: "JOIN_ROOM", roomId: joinRoomId.trim().toUpperCase() });
		},
		[sendMessage],
	);

	const leaveRoom = useCallback(() => {
		cleanupSocket();
		setRoom(null);
		setSelf(null);
		setError("");
		setConnectionStatus("idle");
		attemptedAutoJoinRef.current = false;
	}, [cleanupSocket]);

	const updateName = useCallback(
		(_symbol, name) => {
			if (!localSymbol) return;
			sendMessage({ type: "UPDATE_NAME", name });
		},
		[localSymbol, sendMessage],
	);

	const selectCharacter = useCallback(
		(_symbol, characterId) => {
			if (!localSymbol) return;
			sendMessage({ type: "SELECT_CHARACTER", characterId });
		},
		[localSymbol, sendMessage],
	);

	const toggleLock = useCallback(() => {
		if (!localSymbol) return;
		sendMessage({ type: "TOGGLE_LOCK" });
	}, [localSymbol, sendMessage]);

	const startMatch = useCallback(() => {
		sendMessage({ type: "START_MATCH" });
	}, [sendMessage]);

	const sendChat = useCallback(
		(message) => {
			sendMessage({ type: "SEND_CHAT", message });
		},
		[sendMessage],
	);

	const playMove = useCallback(
		(index) => {
			if (!canPlayBoard) return;
			sendMessage({ type: "PLAY_MOVE", index });
		},
		[canPlayBoard, sendMessage],
	);

	const resetBoard = useCallback(() => {
		sendMessage({ type: "RESET_BOARD" });
	}, [sendMessage]);

	const resetScores = useCallback(() => {
		sendMessage({ type: "RESET_SCORES" });
	}, [sendMessage]);

	const returnToLobby = useCallback(() => {
		sendMessage({ type: "RETURN_TO_LOBBY" });
	}, [sendMessage]);

	const ensureSelectMusic = useCallback(() => {
		startSelectMusic();
	}, []);

	const statusText = useMemo(() => {
		if (!room || !players) return "Create or join a room to start.";

		if (room.status === "lobby") {
			return "Lobby open. Choose a fighter, lock in, and wait for the host to start.";
		}

		if (room.status === "transition") {
			return "Arena loading. Prepare for battle.";
		}

		if (room.status === "fatality") {
			if (room.fatality.result === "success") {
				return `FATALITY! ${players[room.fatality.winner].name} wins the round.`;
			}

			if (room.fatality.result === "fail") {
				return `${players[room.fatality.winner].name} failed the fatality.`;
			}

			return `${players[room.fatality.winner].name} is entering the finishing sequence.`;
		}

		if (room.status === "round_end") {
			const winner = calculateWinner(room.board);
			if (winner) return `Round over. ${players[winner].name} controls the arena.`;
			return "Round over. Draw.";
		}

		return `Turn: ${players[room.currentTurn].name} (${room.currentTurn})`;
	}, [players, room]);

	const statusColor = useMemo(() => {
		if (!room || !players) return "#f4c26b";

		if (room.status === "fatality") return "#ff5c5c";
		if (room.status === "lobby") return "#f4c26b";
		return players[room.currentTurn]?.character.color ?? "#f4c26b";
	}, [players, room]);

	return {
		connectionStatus,
		error,
		room,
		roomId,
		localSymbol,
		isHost,
		players,
		canStartMatch,
		canPlayBoard,
		statusText,
		statusColor,
		canContinueRound,
		showTimer: room?.status === "playing",
		timeLeft: room?.timeLeft ?? 0,
		board: room?.board ?? [],
		fatality: room?.fatality ?? createEmptyFatality(),
		boardFocusSignal,
		shakeClass,
		createRoom,
		joinRoom,
		leaveRoom,
		updateName,
		selectCharacter,
		toggleLock,
		startMatch,
		sendChat,
		playMove,
		continueRound: resetBoard,
		resetBoard,
		resetScores,
		returnToLobby,
		ensureSelectMusic,
	};
}

function createEmptyFatality() {
	return {
		active: false,
		sequence: [],
		progress: 0,
		winner: null,
		result: null,
	};
}
