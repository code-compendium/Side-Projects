import React, { useState, useEffect } from "react";
import "./App.css";

// Winst-lijnen die we vaker gaan gebruiken
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

// Beschikbare Mortal Kombat-stijl personages
const CHARACTERS = [
	{ name: "Scorpion", color: "#FFD700", shadow: "#FF8C00" },
	{ name: "Sub-Zero", color: "#00BFFF", shadow: "#1E90FF" },
	{ name: "Kitana", color: "#9370DB", shadow: "#8B008B" },
	{ name: "Sonya", color: "#7CFC00", shadow: "#228B22" },
	{ name: "Shao Kahn", color: "#FF4500", shadow: "#8B0000" },
	{ name: "Raiden", color: "#FFFFFF", shadow: "#87CEEB" },
];

function calculateWinner(squares) {
	for (let i = 0; i < WIN_LINES.length; i++) {
		const [a, b, c] = WIN_LINES[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}

function checkThreat(squares) {
	for (let line of WIN_LINES) {
		const [a, b, c] = line;
		const vals = [squares[a], squares[b], squares[c]];
		const xCount = vals.filter((v) => v === "X").length;
		const oCount = vals.filter((v) => v === "O").length;
		const nullCount = vals.filter((v) => v === null).length;
		if ((xCount === 2 || oCount === 2) && nullCount === 1) {
			return true;
		}
	}
	return false;
}

const FATALITY_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const KEY_LABELS = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" };
const TIMER = 10;

function App() {
	// Schermen: 'select' = character select, 'game' = speelbord
	const [screen, setScreen] = useState("select");

	const [board, setBoard] = useState(Array(9).fill(null));
	const [xIsNext, setXIsNext] = useState(true);

	// Spelers krijgen nu ook een gekozen personage!
	const [players, setPlayers] = useState({
		X: { name: "Player 1", character: CHARACTERS[0] },
		O: { name: "Player 2", character: CHARACTERS[1] },
	});

	const [timeLeft, setTimeLeft] = useState(TIMER);
	const [shake, setShake] = useState("");

	const [scores, setScores] = useState(() => {
		const savedScores = localStorage.getItem("mk_tictactoe_scores");
		return savedScores ? JSON.parse(savedScores) : { X: 0, O: 0, draws: 0 };
	});

	const [fatality, setFatality] = useState({
		active: false,
		sequence: [],
		progress: 0,
		winner: null,
		result: null,
	});

	const xIsNextRef = React.useRef(xIsNext);
	useEffect(() => {
		xIsNextRef.current = xIsNext;
	}, [xIsNext]);

	useEffect(() => {
		localStorage.setItem("mk_tictactoe_scores", JSON.stringify(scores));
	}, [scores]);

	// === Timer Logica ===
	useEffect(() => {
		const hasWinner = calculateWinner(board);
		const isDraw = !board.includes(null);
		if (screen !== "game" || hasWinner || isDraw || fatality.active) return;

		const timer = setTimeout(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					setXIsNext(!xIsNextRef.current);
					return TIMER;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearTimeout(timer);
	}, [timeLeft, screen, board, fatality.active]);

	const resetGameAfterFail = () => {
		setBoard(Array(9).fill(null));
		setFatality({ active: false, sequence: [], progress: 0, winner: null, result: null });
		setTimeLeft(TIMER);
		// De verliezer van de fatality-poging krijgt nu de schuld: flip beurt naar tegenstander!
		setXIsNext((prev) => !prev);
	};

	// === Fatality Key Listener ===
	useEffect(() => {
		if (!fatality.active || fatality.result) return;

		const handleKeyDown = (e) => {
			if (!FATALITY_KEYS.includes(e.key)) return;
			const targetKey = fatality.sequence[fatality.progress];
			if (e.key === targetKey) {
				const nextProgress = fatality.progress + 1;
				if (nextProgress === fatality.sequence.length) {
					setFatality((prev) => ({ ...prev, result: "success" }));
					setScores((prev) => ({
						...prev,
						[fatality.winner]: prev[fatality.winner] + 1,
					}));
					setShake("shake-hard");
					setTimeout(() => setShake(""), 1000);
				} else {
					setFatality((prev) => ({ ...prev, progress: nextProgress }));
				}
			} else {
				setFatality((prev) => ({ ...prev, result: "fail" }));
				setShake("shake-normal");
				setTimeout(() => {
					setShake("");
					resetGameAfterFail();
				}, 1500);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [fatality]);

	const startGame = (event) => {
		event.preventDefault();
		setBoard(Array(9).fill(null));
		setScreen("game");
		setTimeLeft(TIMER);
		setXIsNext(true);
		setFatality({ active: false, sequence: [], progress: 0, winner: null, result: null });
	};

	const handleSquareClick = (index) => {
		if (board[index] !== null || calculateWinner(board) || fatality.active) return;

		const newBoard = [...board];
		newBoard[index] = xIsNext ? "X" : "O";

		const currentWinner = calculateWinner(newBoard);
		const hasThreat = checkThreat(newBoard);

		if (currentWinner || hasThreat) {
			setShake("shake-hard");
			setTimeout(() => setShake(""), 500);
		} else {
			setShake("shake-normal");
			setTimeout(() => setShake(""), 300);
		}

		if (currentWinner) {
			const randomSequence = Array.from(
				{ length: 10 },
				() => FATALITY_KEYS[Math.floor(Math.random() * FATALITY_KEYS.length)],
			);
			setFatality({
				active: true,
				sequence: randomSequence,
				progress: 0,
				winner: currentWinner,
				result: null,
			});
		} else if (!newBoard.includes(null)) {
			setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
		}

		setBoard(newBoard);
		if (!currentWinner) {
			setXIsNext(!xIsNext);
			if (newBoard.includes(null)) setTimeLeft(TIMER);
		}
	};

	const resetBoard = () => {
		setBoard(Array(9).fill(null));
		setXIsNext(true);
		setTimeLeft(TIMER);
		setFatality({ active: false, sequence: [], progress: 0, winner: null, result: null });
	};

	const resetScores = () => setScores({ X: 0, O: 0, draws: 0 });

	// ==============================================================
	// CHARACTER SELECT SCHERM
	// ==============================================================
	if (screen === "select") {
		return (
			<main className="game-container">
				<h1 className="mk-title">☠ TIC-TAC-KOMBAT ☠</h1>
				<h2 className="mk-subtitle">— Kies je vechter —</h2>

				<form onSubmit={startGame} className="select-form">
					{["X", "O"].map((symbol) => (
						<div key={symbol} className="player-select">
							<h3 style={{ color: players[symbol].character.color }}>
								Speler {symbol === "X" ? "1" : "2"} ({symbol})
							</h3>
							<input
								className="name-input"
								type="text"
								value={players[symbol].name}
								onChange={(e) =>
									setPlayers((prev) => ({
										...prev,
										[symbol]: { ...prev[symbol], name: e.target.value },
									}))
								}
								placeholder={`Naam speler ${symbol === "X" ? "1" : "2"}`}
								required
							/>
							<div className="character-grid">
								{CHARACTERS.map((char) => {
									const isSelected = players[symbol].character.name === char.name;
									return (
										<button
											key={char.name}
											type="button"
											className={`char-btn ${isSelected ? "selected" : ""}`}
											style={{
												borderColor: char.color,
												color: isSelected ? "#000" : char.color,
												backgroundColor: isSelected ? char.color : "transparent",
											}}
											onClick={() =>
												setPlayers((prev) => ({
													...prev,
													[symbol]: { ...prev[symbol], character: char },
												}))
											}
										>
											{char.name}
										</button>
									);
								})}
							</div>
						</div>
					))}
					<button type="submit" className="start-button">
						⚔ FIGHT! ⚔
					</button>
				</form>
			</main>
		);
	}

	// ==============================================================
	// GAME SCHERM
	// ==============================================================
	const winner = calculateWinner(board);
	const currentPlayerSymbol = xIsNext ? "X" : "O";
	const currentPlayer = players[currentPlayerSymbol];
	const winnerPlayer = winner ? players[winner] : null;

	let status;
	if (fatality.active) {
		if (fatality.result === "success")
			status = `FATALITY! ${players[fatality.winner].name.toUpperCase()} WINT!`;
		else if (fatality.result === "fail") status = `FAIL! De fatality mislukt!`;
		else status = `☠ FINISH HIM! Speel de combo! (${players[fatality.winner].name}) ☠`;
	} else if (winner) {
		status = `Winnaar: ${winnerPlayer.name}!`;
	} else if (!board.includes(null)) {
		status = "GELIJKSPEL! (Draw)";
	} else {
		status = `Aan de beurt: ${currentPlayer.name} (${currentPlayerSymbol})`;
	}

	return (
		<main className={`game-container ${shake} ${fatality.active ? "fatality-bg" : ""}`}>
			{fatality.active && <div className="overlay-blood"></div>}

			<h1 className="mk-title">☠ TIC-TAC-KOMBAT ☠</h1>

			{/* Scoreboard */}
			<div className="scoreboard">
				<div style={{ color: players.X.character.color }}>
					<strong>{players.X.name}</strong>
					<br />
					{players.X.character.name}
					<br />
					{scores.X} wins
				</div>
				<div>
					<strong>Draws:</strong>
					<br />
					{scores.draws}
				</div>
				<div style={{ color: players.O.character.color }}>
					<strong>{players.O.name}</strong>
					<br />
					{players.O.character.name}
					<br />
					{scores.O} wins
				</div>
			</div>

			<div
				className="status"
				style={{
					fontSize: fatality.active ? "1.8rem" : "1.3rem",
					color: winner
						? winnerPlayer.character.color
						: fatality.active
							? "#ff0000ff"
							: currentPlayer.character.color,
				}}
			>
				{status}
			</div>

			{fatality.active && !fatality.result && (
				<div className="fatality-sequence">
					{fatality.sequence.map((key, i) => (
						<span
							key={i}
							className={`combo-key ${i < fatality.progress ? "done" : ""} ${i === fatality.progress ? "active" : ""}`}
						>
							{KEY_LABELS[key]}
						</span>
					))}
				</div>
			)}

			{!winner && board.includes(null) && !fatality.active && (
				<div
					className="timer"
					style={{ color: timeLeft <= 3 ? "red" : currentPlayer.character.color }}
				>
					Tijd over: 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
				</div>
			)}

			<div className={`board ${fatality.active ? "disabled" : ""}`}>
				{board.map((square, index) => {
					const squareOwner = square ? players[square] : null;
					return (
						<div
							key={index}
							className="square"
							style={{
								color: squareOwner ? squareOwner.character.color : "#ccc",
								textShadow: squareOwner
									? `0 0 10px ${squareOwner.character.shadow}`
									: "none",
							}}
							onClick={() => handleSquareClick(index)}
						>
							{square}
						</div>
					);
				})}
			</div>

			<div className="button-menu">
				<button onClick={resetBoard}>Reset Speelbord</button>
				<button onClick={() => setScreen("select")}>Nieuwe Vechters</button>
				<button onClick={resetScores} className="danger">
					Reset Scores
				</button>
			</div>
		</main>
	);
}

export default App;
