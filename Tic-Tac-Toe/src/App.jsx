import React, { useState, useEffect } from "react";
import SmokeBackground from "./components/SmokeBackground";

import "./App.css";
import {
	startSelectMusic,
	stopSelectMusic,
	startBattleMusic,
	stopBattleMusic,
	playChooseYourFighter,
	playCardHover,
	playCardSelect,
	playFightClick,
	playStrike,
	playHeavyStrike,
	playFatalityStart,
	playWinner,
	playFatalityFail,
} from "./sounds.js";

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

import imgScorpion from "./assets/images/Scorpion_Insp.png";
import imgSubZero from "./assets/images/Sub-Zero_Insp.png";
import imgKitana from "./assets/images/Kitana_Insp.png";
import imgSonya from "./assets/images/Sonya_Insp.png";
import imgShaoKahn from "./assets/images/Shao-Kahn_Insp.png";
import imgRaiden from "./assets/images/Raiden_Insp.png";

// Beschikbare Mortal Kombat-stijl personages
const CHARACTERS = [
	{ name: "Scorpion", color: "#ffcc00", shadow: "#ff6600", img: imgScorpion },
	{ name: "Sub-Zero", color: "#00ccff", shadow: "#0033ff", img: imgSubZero },
	{ name: "Kitana", color: "#3366ff", shadow: "#000099", img: imgKitana },
	{ name: "Sonya", color: "#33cc33", shadow: "#006600", img: imgSonya },
	{ name: "Shao Kahn", color: "#ff3300", shadow: "#660000", img: imgShaoKahn },
	{ name: "Raiden", color: "#ffffff", shadow: "#00ffff", img: imgRaiden },
];

const TIMER = 10;
const FATALITY_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const KEY_LABELS = {
	ArrowUp: "↑",
	ArrowDown: "↓",
	ArrowLeft: "←",
	ArrowRight: "→",
};

/**
 * Controleert de winst en dreiging (2 op een rij)
 */
function calculateWinner(squares) {
	for (let line of WIN_LINES) {
		const [a, b, c] = line;
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

function App() {
	const [screen, setScreen] = useState("select");
	const [board, setBoard] = useState(Array(9).fill(null));
	const [xIsNext, setXIsNext] = useState(true);
	const [shake, setShake] = useState("");
	const [timeLeft, setTimeLeft] = useState(TIMER);
	const [scores, setScores] = useState(() => {
		const saved = localStorage.getItem("mk_tictactoe_scores");
		return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
	});

	const [players, setPlayers] = useState({
		X: { name: "", character: CHARACTERS[0], locked: false },
		O: { name: "", character: CHARACTERS[1], locked: false },
	});

	const [fatality, setFatality] = useState({
		active: false,
		sequence: [],
		progress: 0,
		winner: null,
		result: null,
	});

	const [isTransitioning, setIsTransitioning] = useState(false);

	const xIsNextRef = React.useRef(xIsNext);
	useEffect(() => {
		xIsNextRef.current = xIsNext;
	}, [xIsNext]);

	// Start de muziek zodra de app laadt of op select scherm komt
	useEffect(() => {
		if (screen === "select") {
			playChooseYourFighter();
			startSelectMusic();
			stopBattleMusic();
		} else if (screen === "game") {
			stopSelectMusic();
			startBattleMusic();
		}
		return () => {
			stopSelectMusic();
			stopBattleMusic();
		};
	}, [screen]);

	useEffect(() => {
		localStorage.setItem("mk_tictactoe_scores", JSON.stringify(scores));
	}, [scores]);

	// === Timer Logica ===
	useEffect(() => {
		if (fatality.active || calculateWinner(board) || !board.includes(null)) return;

		const interval = setInterval(() => {
			if (timeLeft <= 1) {
				// Tijd is om: wissel beurt en reset timer
				setXIsNext((prev) => !prev);
				setTimeLeft(TIMER);
			} else {
				// Tel af
				setTimeLeft((prev) => prev - 1);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [board, fatality.active, timeLeft]);

	const resetGameAfterFail = React.useCallback(() => {
		setBoard(Array(9).fill(null));
		setFatality({ active: false, sequence: [], progress: 0, winner: null, result: null });
		setTimeLeft(TIMER);
		// We draaien de beurt NIET om, want handleSquareClick heeft dat al gedaan.
		// Zo krijgt de andere speler de beurt als de winnaar zijn fatality verpest.
	}, []);

	// === Fatality Timeout (10s) ===
	useEffect(() => {
		if (!fatality.active || fatality.result) return;

		const timer = setTimeout(() => {
			setFatality((prev) => ({ ...prev, result: "fail" }));
			playFatalityFail();
			setShake("shake-normal");
			setTimeout(() => {
				setShake("");
				resetGameAfterFail();
			}, 2000);
		}, 10000);

		return () => clearTimeout(timer);
	}, [fatality.active, fatality.result, resetGameAfterFail]);

	// === Fatality Key Listener ===
	useEffect(() => {
		if (!fatality.active || fatality.result) return;

		const handleKeyDown = (e) => {
			if (!FATALITY_KEYS.includes(e.key)) return;
			e.preventDefault();
			const targetKey = fatality.sequence[fatality.progress];
			if (e.key === targetKey) {
				const nextProgress = fatality.progress + 1;
				if (nextProgress === fatality.sequence.length) {
					setFatality((prev) => ({ ...prev, result: "success" }));
					playWinner();
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
				playFatalityFail();
				setShake("shake-normal");
				setTimeout(() => {
					setShake("");
					resetGameAfterFail();
				}, 2000);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [fatality, resetGameAfterFail]);

	// === Game Logica ===
	const handleSquareClick = (index) => {
		if (board[index] || calculateWinner(board) || fatality.active) return;

		const newBoard = board.slice();
		newBoard[index] = xIsNext ? "X" : "O";

		const currentWinner = calculateWinner(newBoard);
		const hasThreat = checkThreat(newBoard);

		// Visuele impact bepalen
		if (currentWinner || hasThreat) {
			playHeavyStrike();
			setShake("shake-hard");
			setTimeout(() => setShake(""), 500);
		} else {
			playStrike();
			setShake("shake-normal");
			setTimeout(() => setShake(""), 350);
		}

		if (currentWinner) {
			const randomSequence = Array.from(
				{ length: 10 },
				() => FATALITY_KEYS[Math.floor(Math.random() * FATALITY_KEYS.length)],
			);
			playFatalityStart();
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
		setXIsNext(!xIsNext);
		setTimeLeft(TIMER);
	};

	const startGame = (event) => {
		event.preventDefault();
		if (!players.X.locked || !players.O.locked) return;

		playFightClick();
		setIsTransitioning(true);

		setTimeout(() => {
			setBoard(Array(9).fill(null));
			setScreen("game");
			setTimeLeft(TIMER);
			setXIsNext(true);
			setFatality({
				active: false,
				sequence: [],
				progress: 0,
				winner: null,
				result: null,
			});
			setTimeout(() => {
				setIsTransitioning(false);
			}, 50);
		}, 2000); // 2 seconden transition
	};

	const resetBoard = () => {
		setBoard(Array(9).fill(null));
		setXIsNext(true);
		setTimeLeft(TIMER);
		setFatality({ active: false, sequence: [], progress: 0, winner: null, result: null });
	};

	const resetScores = () => {
		if (window.confirm("Weet je zeker dat je alle scores wilt wissen?")) {
			setScores({ X: 0, O: 0, draws: 0 });
		}
	};

	const toggleLock = (symbol) => {
		const otherSymbol = symbol === "X" ? "O" : "X";
		setPlayers((prev) => {
			const isCurrentlyLocked = prev[symbol].locked;
			if (isCurrentlyLocked) {
				return { ...prev, [symbol]: { ...prev[symbol], locked: false } };
			} else {
				let newState = { ...prev, [symbol]: { ...prev[symbol], locked: true } };
				// Als de andere speler zijn character nog NIET gelocked heeft, én op hetzelfde personage zat als wat we net locken:
				// push die andere speler dan direct naar een ander beschikbaar personage.
				if (
					!newState[otherSymbol].locked &&
					newState[otherSymbol].character.name === newState[symbol].character.name
				) {
					const availableChar = CHARACTERS.find(
						(c) => c.name !== newState[symbol].character.name,
					);
					newState[otherSymbol] = { ...newState[otherSymbol], character: availableChar };
				}
				return newState;
			}
		});
	};

	// === Renders ===
	const winner = calculateWinner(board);
	const currentPlayer = xIsNext ? players.X : players.O;
	const winnerPlayer = winner ? players[winner] : null;

	let status;
	if (fatality.active) {
		if (fatality.result === "success")
			status = `FATALITY! ${players[fatality.winner].name.toUpperCase()} WINS!`;
		else if (fatality.result === "fail") status = `FAIL!`;
		else status = `☠ FINISH HIM! (${players[fatality.winner].name}) ☠`;
	} else if (winner) {
		status = `Winner: ${winnerPlayer.name}!`;
	} else if (!board.includes(null)) {
		status = "Draw!";
	} else {
		status = `Turn: ${currentPlayer.name} (${xIsNext ? "X" : "O"})`;
	}

	return (
		<main className={`game-container ${shake} ${fatality.active ? "fatality-bg" : ""}`}>
			<SmokeBackground />
			<div className={`transition-smoke ${isTransitioning ? "active" : ""}`}>
				<h2 className="fight-text">FIGHT!</h2>
			</div>

			{screen === "select" ? (
				<form className="select-form" onSubmit={startGame}>
					<h1 className="mk-title">Tic-Tac-Kombat</h1>
					<p className="mk-subtitle">Choose Your Fighter</p>

					<div className="players-container">
						{["X", "O"].map((symbol) => (
							<div key={symbol} className="player-select">
								<h3>
									Player {symbol === "X" ? "1" : "2"} ({symbol})
								</h3>
								<input
									className="name-input"
									type="text"
									value={players[symbol].name}
									disabled={players[symbol].locked}
									onChange={(e) =>
										setPlayers((prev) => ({
											...prev,
											[symbol]: { ...prev[symbol], name: e.target.value },
										}))
									}
									placeholder={`Naam speler ${symbol === "X" ? "1" : "2"}`}
									required
								/>
								<div
									className={`character-grid ${players[symbol].locked ? "grid-locked" : ""}`}
								>
									{CHARACTERS.map((char) => {
										const isSelected = players[symbol].character.name === char.name;
										const otherSymbol = symbol === "X" ? "O" : "X";
										const isTakenByOther =
											players[otherSymbol].locked &&
											players[otherSymbol].character.name === char.name;

										return (
											<button
												key={char.name}
												type="button"
												className={`char-card ${isSelected ? "selected" : ""} ${isTakenByOther ? "taken" : ""}`}
												style={{ "--char-color": char.color }}
												disabled={isTakenByOther || players[symbol].locked}
												onMouseEnter={() => {
													if (!isTakenByOther && !players[symbol].locked) {
														playCardHover();
													}
												}}
												onClick={() => {
													if (!isTakenByOther && !players[symbol].locked) {
														playCardSelect();
														setPlayers((prev) => ({
															...prev,
															[symbol]: { ...prev[symbol], character: char },
														}));
													}
												}}
											>
												<img src={char.img} alt={char.name} className="char-img" />
												<span className="char-name">{char.name}</span>
											</button>
										);
									})}
								</div>

								<button
									type="button"
									className={`lock-button ${players[symbol].locked ? "locked" : ""}`}
									onClick={() => toggleLock(symbol)}
									disabled={players[symbol].name.length === 0}
								>
									{players[symbol].locked ? "🔒 UNLOCK" : "🔒 LOCK"}
								</button>
							</div>
						))}
					</div>

					{players.X.locked && players.O.locked ? (
						<button type="submit" className="start-button">
							⚔ FIGHT! ⚔
						</button>
					) : (
						<div className="fight-waiting">Both players must lock in to start...</div>
					)}
				</form>
			) : (
				<div className="game-board-container">
					{fatality.active && !fatality.result && <div className="overlay-blood" />}

					<h1 className="mk-title">Tic-Tac-Kombat</h1>

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
							Time left: 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
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
						<button onClick={resetBoard}>Reset Board</button>
						<button onClick={() => setScreen("select")}>New Fighters</button>
						<button onClick={resetScores} className="danger">
							Reset Scores
						</button>
					</div>
				</div>
			)}
		</main>
	);
}

export default App;
