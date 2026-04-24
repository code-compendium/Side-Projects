import { useEffect, useMemo, useState } from "react";
import "./App.css";
import SmokeBackground from "./components/SmokeBackground";
import CharacterSelectPanel from "./components/CharacterSelectPanel";
import ChatPanel from "./components/ChatPanel";
import FatalitySequence from "./components/FatalitySequence";
import GameBoard from "./components/GameBoard";
import InvitePanel from "./components/InvitePanel";
import Scoreboard from "./components/Scoreboard";
import StatusBanner from "./components/StatusBanner";
import { useLocalGame } from "./hooks/useLocalGame";
import { useOnlineGame } from "./hooks/useOnlineGame";

function LocalView({ game }) {
	const {
		transitionActive,
		players,
		canStart,
		startGame,
		ensureSelectMusic,
		setPlayerName,
		selectCharacter,
		toggleLock,
		screen,
		scoreboardPlayers,
		scores,
		statusText,
		statusColor,
		canContinueRound,
		showTimer,
		timeLeft,
		board,
		boardFocusSignal,
		boardLocked,
		playMove,
		continueRound,
		fatality,
		resetBoard,
		resetScores,
		goToSelect,
	} = game;

	return (
		<>
			<div className={`transition-smoke ${transitionActive ? "active" : ""}`}>
				<h2 className="fight-text">FIGHT!</h2>
			</div>

			{screen === "select" ? (
				<form
					className="screen-shell select-shell"
					onSubmit={(event) => {
						event.preventDefault();
						startGame();
					}}
					onPointerDownCapture={ensureSelectMusic}
					onKeyDownCapture={ensureSelectMusic}
				>
					<div className="title-block">
						<h1 className="mk-title">Tic-Tac-Kombat</h1>
						<p className="mk-subtitle">Local versus mode</p>
					</div>

					<div className="players-grid">
						<CharacterSelectPanel
							player={players.X}
							otherPlayer={players.O}
							symbol="X"
							label="Player 1"
							isEditable
							onNameChange={setPlayerName}
							onCharacterSelect={selectCharacter}
							onToggleLock={toggleLock}
						/>
						<CharacterSelectPanel
							player={players.O}
							otherPlayer={players.X}
							symbol="O"
							label="Player 2"
							isEditable
							onNameChange={setPlayerName}
							onCharacterSelect={selectCharacter}
							onToggleLock={toggleLock}
						/>
					</div>

					{canStart ? (
						<button type="submit" className="primary-button start-button">
							FIGHT!
						</button>
					) : (
						<div className="info-banner">Both players must lock in before the match can start.</div>
					)}
				</form>
			) : (
				<section className="screen-shell game-shell">
					<div className="title-block compact">
						<h1 className="mk-title">Tic-Tac-Kombat</h1>
						<p className="mk-subtitle">Local showdown</p>
					</div>

					<Scoreboard players={scoreboardPlayers} scores={scores} />
					<StatusBanner
						statusText={statusText}
						statusColor={statusColor}
						showTimer={showTimer}
						timeLeft={timeLeft}
					/>
					<FatalitySequence fatality={fatality} />
					<GameBoard
						board={board}
						players={scoreboardPlayers}
						onSelect={playMove}
						isDisabled={boardLocked}
						canContinueRound={canContinueRound}
						onContinueRound={continueRound}
						focusSignal={boardFocusSignal}
					/>

					<div className="button-row">
						<button type="button" className="secondary-button" onClick={resetBoard}>
							Reset Board
						</button>
						<button type="button" className="secondary-button" onClick={goToSelect}>
							New Fighters
						</button>
						<button type="button" className="danger-button" onClick={resetScores}>
							Reset Scores
						</button>
					</div>
				</section>
			)}
		</>
	);
}

function OnlineView({ game, onSwitchLocal }) {
	const [joinCode, setJoinCode] = useState("");
	const [chatDraft, setChatDraft] = useState("");
	const {
		connectionStatus,
		error,
		room,
		roomId,
		localSymbol,
		isHost,
		createRoom,
		joinRoom,
		leaveRoom,
		players,
		canStartMatch,
		updateName,
		selectCharacter,
		toggleLock,
		startMatch,
		sendChat,
		ensureSelectMusic,
		statusText,
		statusColor,
		canContinueRound,
		showTimer,
		timeLeft,
		board,
		boardFocusSignal,
		canPlayBoard,
		playMove,
		continueRound,
		fatality,
		resetBoard,
		resetScores,
		returnToLobby,
	} = game;

	const playerPanels = players ?? null;

	const handleJoinSubmit = (event) => {
		event.preventDefault();
		joinRoom(joinCode);
	};

	const handleSendChat = (event) => {
		event.preventDefault();
		if (!chatDraft.trim()) return;
		sendChat(chatDraft);
		setChatDraft("");
	};

	if (!roomId) {
		return (
			<section className="screen-shell online-home">
				<div className="title-block">
					<h1 className="mk-title">Tic-Tac-Kombat</h1>
					<p className="mk-subtitle">Realtime multiplayer lobby</p>
				</div>

				<div className="mode-card-grid">
					<div className="mode-card">
						<h2>Create a room</h2>
						<p>
							Open a private lobby, lock in as Player 1 (X), and send the invite link to your
							opponent.
						</p>
						<button
							type="button"
							className="primary-button"
							onClick={createRoom}
							disabled={connectionStatus === "connecting"}
						>
							Create Lobby
						</button>
					</div>

					<form className="mode-card" onSubmit={handleJoinSubmit}>
						<h2>Join a room</h2>
						<p>Paste a room code from your host to join as Player 2 (O).</p>
						<input
							className="name-input join-input"
							type="text"
							value={joinCode}
							onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
							placeholder="Room code"
							maxLength={8}
						/>
						<button
							type="submit"
							className="primary-button"
							disabled={connectionStatus === "connecting" || joinCode.trim().length < 4}
						>
							Join Lobby
						</button>
					</form>
				</div>

				{error ? <div className="error-banner">{error}</div> : null}

				<div className="helper-row">
					<button type="button" className="secondary-button" onClick={onSwitchLocal}>
						Back to Local Mode
					</button>
					<div className="connection-pill">Connection: {connectionStatus}</div>
				</div>
			</section>
		);
	}

	const inLobby = room?.status === "lobby";

	return (
		<>
			<div className={`transition-smoke ${room?.status === "transition" ? "active" : ""}`}>
				<h2 className="fight-text">FIGHT!</h2>
			</div>

			<section className="screen-shell online-shell">
				<div className="top-utility-row">
					<div className="connection-pill">
						Room {roomId} | {connectionStatus}
					</div>
					<div className="inline-actions">
						<button type="button" className="secondary-button" onClick={leaveRoom}>
							Leave Room
						</button>
						<button type="button" className="secondary-button" onClick={onSwitchLocal}>
							Local Mode
						</button>
					</div>
				</div>

				<div className="title-block compact">
					<h1 className="mk-title">Tic-Tac-Kombat</h1>
					<p className="mk-subtitle">
						{inLobby ? "Lobby and fighter select" : "Online versus match"}
					</p>
				</div>

				{error ? <div className="error-banner">{error}</div> : null}

				{inLobby ? (
					<div className="online-layout">
						<div
							className="lobby-column"
							onPointerDownCapture={ensureSelectMusic}
							onKeyDownCapture={ensureSelectMusic}
						>
							<InvitePanel roomId={roomId} />
							<div className="players-grid">
								<CharacterSelectPanel
									player={playerPanels.X}
									otherPlayer={playerPanels.O}
									symbol="X"
									label="Host"
									isEditable={localSymbol === "X"}
									onNameChange={updateName}
									onCharacterSelect={selectCharacter}
									onToggleLock={toggleLock}
								/>
								<CharacterSelectPanel
									player={playerPanels.O}
									otherPlayer={playerPanels.X}
									symbol="O"
									label="Guest"
									isEditable={localSymbol === "O"}
									onNameChange={updateName}
									onCharacterSelect={selectCharacter}
									onToggleLock={toggleLock}
								/>
							</div>

							<div className="button-row">
								<button
									type="button"
									className="primary-button"
									onClick={startMatch}
									disabled={!isHost || !canStartMatch}
								>
									{isHost ? "Start Match" : "Waiting for host"}
								</button>
								{!canStartMatch ? (
									<div className="info-banner compact">
										Both players need to be connected and locked in before the host can start.
									</div>
								) : null}
							</div>
						</div>

						<ChatPanel
							title="Lobby chat"
							messages={room.chatMessages}
							value={chatDraft}
							onChange={setChatDraft}
							onSubmit={handleSendChat}
							disabled={!localSymbol}
						/>
					</div>
				) : (
					<div className="online-layout match-layout">
						<div className="match-column">
							<Scoreboard players={playerPanels} scores={room.scores} />
							<StatusBanner
								statusText={statusText}
								statusColor={statusColor}
								showTimer={showTimer}
								timeLeft={timeLeft}
							/>
							<FatalitySequence fatality={fatality} />
							<GameBoard
								board={board}
								players={playerPanels}
								onSelect={playMove}
								isDisabled={!canPlayBoard}
								canContinueRound={canContinueRound}
								onContinueRound={continueRound}
								focusSignal={boardFocusSignal}
							/>

							<div className="button-row">
								<button
									type="button"
									className="secondary-button"
									onClick={resetBoard}
									disabled={!isHost}
								>
									Next Round
								</button>
								<button
									type="button"
									className="secondary-button"
									onClick={returnToLobby}
									disabled={!isHost}
								>
									Return to Lobby
								</button>
								<button
									type="button"
									className="danger-button"
									onClick={resetScores}
									disabled={!isHost}
								>
									Reset Scores
								</button>
							</div>
						</div>

						<ChatPanel
							title="Team chat"
							messages={room.chatMessages}
							value={chatDraft}
							onChange={setChatDraft}
							onSubmit={handleSendChat}
							disabled={!localSymbol}
						/>
					</div>
				)}
			</section>
		</>
	);
}

function App() {
	const initialRoomId = useMemo(() => {
		const params = new URLSearchParams(window.location.search);
		return params.get("room")?.trim().toUpperCase() ?? "";
	}, []);

	const [mode, setMode] = useState(initialRoomId ? "online" : "local");
	const localGame = useLocalGame({ enabled: mode === "local" });
	const onlineGame = useOnlineGame({
		enabled: mode === "online",
		initialRoomId,
	});

	const switchToLocal = () => {
		if (mode === "online") {
			onlineGame.leaveRoom();
		}
		setMode("local");
	};

	const switchToOnline = () => {
		setMode("online");
	};

	useEffect(() => {
		const url = new URL(window.location.href);

		if (mode === "online" && onlineGame.roomId) {
			url.searchParams.set("room", onlineGame.roomId);
		} else {
			url.searchParams.delete("room");
		}

		window.history.replaceState({}, "", url);
	}, [mode, onlineGame.roomId]);

	const activeFatality = mode === "online" ? onlineGame.fatality?.active : localGame.fatality.active;
	const activeShake = mode === "online" ? onlineGame.shakeClass : localGame.shakeClass;

	return (
		<main className={`game-container ${activeShake} ${activeFatality ? "fatality-bg" : ""}`}>
			<SmokeBackground />

			<div className="mode-switcher" role="tablist" aria-label="Game mode">
				<button
					type="button"
					role="tab"
					aria-selected={mode === "local"}
					className={`mode-button ${mode === "local" ? "active" : ""}`}
					onClick={switchToLocal}
				>
					Local
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={mode === "online"}
					className={`mode-button ${mode === "online" ? "active" : ""}`}
					onClick={switchToOnline}
				>
					Online
				</button>
			</div>

			{mode === "local" ? (
				<LocalView game={localGame} />
			) : (
				<OnlineView game={onlineGame} onSwitchLocal={switchToLocal} />
			)}
		</main>
	);
}

export default App;
