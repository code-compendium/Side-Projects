import { randomBytes, randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 3001);
const TURN_SECONDS = 10;
const FATALITY_SECONDS = 10;
const FATALITY_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const WIN_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];
const CHARACTER_IDS = ["scorpion", "sub-zero", "kitana", "sonya", "shao-kahn", "raiden"];
const rooms = new Map();

const server = new WebSocketServer({ port: PORT });

server.on("connection", (socket) => {
	socket.meta = {
		roomId: null,
		playerId: null,
	};

	socket.on("message", (buffer) => {
		try {
			const message = JSON.parse(String(buffer));
			handleMessage(socket, message);
		} catch {
			sendError(socket, "Invalid room message.");
		}
	});

	socket.on("close", () => {
		handleDisconnect(socket);
	});
});

console.log(`Tic-Tac-Kombat room server listening on ws://localhost:${PORT}`);

function handleMessage(socket, message) {
	switch (message.type) {
		case "CREATE_ROOM":
			return createRoom(socket);
		case "JOIN_ROOM":
			return joinRoom(socket, message.roomId);
		case "UPDATE_NAME":
			return withRoomPlayer(socket, ({ room, player }) => {
				player.name = sanitizeName(message.name) || `Player ${player.symbol}`;
				broadcastRoom(room);
			});
		case "SELECT_CHARACTER":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (player.locked) return;
				if (!CHARACTER_IDS.includes(message.characterId)) {
					sendError(socket, "Unknown fighter.");
					return;
				}

				const opponent = room.players[getOppositeSymbol(player.symbol)];
				if (opponent.locked && opponent.characterId === message.characterId) {
					sendError(socket, "That fighter is already locked by the other player.");
					return;
				}

				player.characterId = message.characterId;
				broadcastRoom(room);
			});
		case "TOGGLE_LOCK":
			return withRoomPlayer(socket, ({ room, player }) => {
				const opponent = room.players[getOppositeSymbol(player.symbol)];
				if (!sanitizeName(player.name)) {
					sendError(socket, "Enter a player name before locking in.");
					return;
				}

				if (player.locked) {
					player.locked = false;
				} else {
					player.locked = true;
					if (!opponent.locked && opponent.characterId === player.characterId) {
						opponent.characterId = getFallbackCharacter(player.characterId);
					}
				}

				broadcastRoom(room);
			});
		case "START_MATCH":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (!player.isHost) {
					sendError(socket, "Only the host can start the match.");
					return;
				}

				if (!canStartMatch(room)) {
					sendError(socket, "Both players must be connected and locked in.");
					return;
				}

				room.status = "transition";
				room.board = createEmptyBoard();
				room.fatality = createFatalityState();
				room.timeLeft = TURN_SECONDS;
				stopTimers(room);
				broadcastRoom(room);
				room.transitionTimer = setTimeout(() => {
					room.status = "playing";
					room.board = createEmptyBoard();
					room.currentTurn = room.nextStarter;
					room.timeLeft = TURN_SECONDS;
					startTurnTimer(room);
					broadcastRoom(room);
				}, 2000);
			});
		case "SEND_CHAT":
			return withRoomPlayer(socket, ({ room, player }) => {
				const text = sanitizeChat(message.message);
				if (!text) return;
				room.chatMessages.push({
					id: randomUUID(),
					author: player.name || `Player ${player.symbol}`,
					message: text,
					timestamp: Date.now(),
					system: false,
				});
				room.chatMessages = room.chatMessages.slice(-40);
				broadcastRoom(room);
			});
		case "PLAY_MOVE":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (room.status !== "playing") return;
				if (player.symbol !== room.currentTurn) {
					sendError(socket, "It is not your turn.");
					return;
				}

				const index = Number(message.index);
				if (!Number.isInteger(index) || index < 0 || index > 8 || room.board[index]) {
					sendError(socket, "That move is not valid.");
					return;
				}

				room.board[index] = player.symbol;
				const winner = calculateWinner(room.board);
				const boardFilled = room.board.every(Boolean);

				if (winner) {
					stopTurnTimer(room);
					room.status = "fatality";
					room.fatality = {
						active: true,
						sequence: createFatalitySequence(),
						progress: 0,
						winner,
						result: null,
					};
					room.fatalityTimer = setTimeout(() => {
						failFatality(room);
					}, FATALITY_SECONDS * 1000);
					broadcastRoom(room);
					return;
				}

				if (boardFilled) {
					stopTurnTimer(room);
					room.status = "round_end";
					room.scores.draws += 1;
					room.nextStarter = getOppositeSymbol(room.currentTurn);
					broadcastRoom(room);
					return;
				}

				room.currentTurn = getOppositeSymbol(room.currentTurn);
				room.timeLeft = TURN_SECONDS;
				restartTurnTimer(room);
				broadcastRoom(room);
			});
		case "FATALITY_INPUT":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (room.status !== "fatality" || player.symbol !== room.fatality.winner) return;
				if (!FATALITY_KEYS.includes(message.key)) return;

				const expectedKey = room.fatality.sequence[room.fatality.progress];
				if (message.key === expectedKey) {
					room.fatality.progress += 1;
					if (room.fatality.progress === room.fatality.sequence.length) {
						clearTimeout(room.fatalityTimer);
						room.fatality.result = "success";
						room.scores[player.symbol] += 1;
						room.nextStarter = player.symbol;
						room.status = "round_end";
					}
				} else {
					failFatality(room);
				}

				broadcastRoom(room);
			});
		case "RESET_BOARD":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (!player.isHost) {
					sendError(socket, "Only the host can reset the board.");
					return;
				}

				room.status = "playing";
				room.board = createEmptyBoard();
				room.fatality = createFatalityState();
				room.currentTurn = room.nextStarter;
				room.timeLeft = TURN_SECONDS;
				restartTurnTimer(room);
				broadcastRoom(room);
			});
		case "RESET_SCORES":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (!player.isHost) {
					sendError(socket, "Only the host can reset the scores.");
					return;
				}

				room.scores = { X: 0, O: 0, draws: 0 };
				broadcastRoom(room);
			});
		case "RETURN_TO_LOBBY":
			return withRoomPlayer(socket, ({ room, player }) => {
				if (!player.isHost) {
					sendError(socket, "Only the host can return to the lobby.");
					return;
				}

				returnToLobby(room);
				broadcastRoom(room);
			});
		default:
			sendError(socket, "Unknown room action.");
	}
}

function createRoom(socket) {
	const roomId = createRoomId();
	const room = createRoomState(roomId);
	const host = room.players.X;
	host.id = randomUUID();
	host.name = "Host";
	host.connected = true;
	host.socket = socket;

	socket.meta = {
		roomId,
		playerId: host.id,
	};

	rooms.set(roomId, room);
	broadcastRoom(room);
}

function joinRoom(socket, rawRoomId) {
	const roomId = String(rawRoomId ?? "").trim().toUpperCase();
	const room = rooms.get(roomId);
	if (!room) {
		sendError(socket, "That room does not exist.");
		return;
	}

	const slot = room.players.O.connected
		? room.players.X.connected
			? null
			: room.players.X
		: room.players.O;

	if (!slot) {
		sendError(socket, "That room is already full.");
		return;
	}

	slot.id = randomUUID();
	slot.name = slot.symbol === "X" ? "Host" : "Guest";
	slot.connected = true;
	slot.socket = socket;
	slot.locked = false;

	socket.meta = {
		roomId,
		playerId: slot.id,
	};

	appendSystemMessage(room, `${slot.symbol === "X" ? "Host" : "Guest"} joined the lobby.`);
	broadcastRoom(room);
}

function withRoomPlayer(socket, callback) {
	const room = rooms.get(socket.meta.roomId);
	if (!room) {
		sendError(socket, "Room not found.");
		return;
	}

	const player = Object.values(room.players).find((entry) => entry.id === socket.meta.playerId);
	if (!player) {
		sendError(socket, "Player not found.");
		return;
	}

	callback({ room, player });
}

function broadcastRoom(room) {
	for (const player of Object.values(room.players)) {
		if (player.socket?.readyState === 1) {
			player.socket.send(
				JSON.stringify({
					type: "ROOM_STATE",
					room: serializeRoom(room),
					self: {
						playerId: player.id,
						symbol: player.symbol,
					},
				}),
			);
		}
	}
}

function serializeRoom(room) {
	return {
		id: room.id,
		status: room.status,
		board: room.board,
		currentTurn: room.currentTurn,
		nextStarter: room.nextStarter,
		timeLeft: room.timeLeft,
		scores: room.scores,
		fatality: room.fatality,
		chatMessages: room.chatMessages,
		players: {
			X: publicPlayer(room.players.X),
			O: publicPlayer(room.players.O),
		},
	};
}

function publicPlayer(player) {
	return {
		symbol: player.symbol,
		name: player.name,
		characterId: player.characterId,
		locked: player.locked,
		connected: player.connected,
		isHost: player.isHost,
	};
}

function createRoomState(roomId) {
	return {
		id: roomId,
		status: "lobby",
		board: createEmptyBoard(),
		currentTurn: "X",
		nextStarter: "X",
		timeLeft: TURN_SECONDS,
		scores: { X: 0, O: 0, draws: 0 },
		fatality: createFatalityState(),
		chatMessages: [
			{
				id: randomUUID(),
				author: "System",
				message: "Lobby ready. Host is Player 1 (X), guest is Player 2 (O).",
				timestamp: Date.now(),
				system: true,
			},
		],
		players: {
			X: createPlayer("X", true, "scorpion"),
			O: createPlayer("O", false, "sub-zero"),
		},
		turnTimer: null,
		transitionTimer: null,
		fatalityTimer: null,
	};
}

function createPlayer(symbol, isHost, characterId) {
	return {
		id: null,
		symbol,
		name: "",
		characterId,
		locked: false,
		connected: false,
		isHost,
		socket: null,
	};
}

function createRoomId() {
	return randomBytes(3).toString("hex").toUpperCase();
}

function sendError(socket, message) {
	if (socket.readyState !== 1) return;
	socket.send(JSON.stringify({ type: "ERROR", message }));
}

function createEmptyBoard() {
	return Array(9).fill(null);
}

function createFatalityState() {
	return {
		active: false,
		sequence: [],
		progress: 0,
		winner: null,
		result: null,
	};
}

function calculateWinner(board) {
	for (const [a, b, c] of WIN_LINES) {
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a];
		}
	}

	return null;
}

function createFatalitySequence() {
	return Array.from({ length: 10 }, () => FATALITY_KEYS[Math.floor(Math.random() * FATALITY_KEYS.length)]);
}

function getOppositeSymbol(symbol) {
	return symbol === "X" ? "O" : "X";
}

function sanitizeName(name) {
	return String(name ?? "").trim().slice(0, 24);
}

function sanitizeChat(message) {
	return String(message ?? "").trim().slice(0, 240);
}

function canStartMatch(room) {
	return (
		room.players.X.connected &&
		room.players.O.connected &&
		room.players.X.locked &&
		room.players.O.locked
	);
}

function getFallbackCharacter(characterId) {
	return CHARACTER_IDS.find((entry) => entry !== characterId) ?? CHARACTER_IDS[0];
}

function appendSystemMessage(room, message) {
	room.chatMessages.push({
		id: randomUUID(),
		author: "System",
		message,
		timestamp: Date.now(),
		system: true,
	});
	room.chatMessages = room.chatMessages.slice(-40);
}

function startTurnTimer(room) {
	stopTurnTimer(room);
	room.turnTimer = setInterval(() => {
		room.timeLeft -= 1;
		if (room.timeLeft <= 0) {
			room.currentTurn = getOppositeSymbol(room.currentTurn);
			room.timeLeft = TURN_SECONDS;
		}
		broadcastRoom(room);
	}, 1000);
}

function stopTurnTimer(room) {
	clearInterval(room.turnTimer);
	room.turnTimer = null;
}

function restartTurnTimer(room) {
	stopTurnTimer(room);
	startTurnTimer(room);
}

function stopTimers(room) {
	stopTurnTimer(room);
	clearTimeout(room.transitionTimer);
	clearTimeout(room.fatalityTimer);
	room.transitionTimer = null;
	room.fatalityTimer = null;
}

function failFatality(room) {
	clearTimeout(room.fatalityTimer);
	room.fatality.result = "fail";
	room.status = "round_end";
	room.nextStarter = getOppositeSymbol(room.fatality.winner);
}

function returnToLobby(room) {
	stopTimers(room);
	room.status = "lobby";
	room.board = createEmptyBoard();
	room.currentTurn = "X";
	room.nextStarter = "X";
	room.timeLeft = TURN_SECONDS;
	room.fatality = createFatalityState();
	room.players.X.locked = false;
	room.players.O.locked = false;
	appendSystemMessage(room, "Returned to the lobby for a new character select.");
}

function handleDisconnect(socket) {
	const room = rooms.get(socket.meta.roomId);
	if (!room) return;

	const player = Object.values(room.players).find((entry) => entry.id === socket.meta.playerId);
	if (!player) return;

	player.connected = false;
	player.socket = null;
	player.locked = false;
	appendSystemMessage(room, `${player.name || `Player ${player.symbol}`} disconnected.`);

	if (room.status !== "lobby") {
		returnToLobby(room);
	}

	broadcastRoom(room);
}
