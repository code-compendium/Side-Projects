function Scoreboard({ players, scores }) {
	return (
		<div className="scoreboard">
			<div style={{ color: players.X.character.color }}>
				<strong>{players.X.name || "Player 1"}</strong>
				<span>{players.X.character.name}</span>
				<span>{scores.X} wins</span>
			</div>
			<div>
				<strong>Draws</strong>
				<span>{scores.draws}</span>
			</div>
			<div style={{ color: players.O.character.color }}>
				<strong>{players.O.name || "Player 2"}</strong>
				<span>{players.O.character.name}</span>
				<span>{scores.O} wins</span>
			</div>
		</div>
	);
}

export default Scoreboard;
