import { CHARACTERS, getCharacterById } from "../constants/characters";
import { playCardHover } from "../sounds";

function CharacterSelectPanel({
	player,
	otherPlayer,
	symbol,
	label,
	isEditable,
	onNameChange,
	onCharacterSelect,
	onToggleLock,
}) {
	const presenceText = player.connected === false ? "Disconnected" : player.locked ? "Locked in" : "Selecting";

	return (
		<section className="player-select">
			<div className="panel-heading">
				<h2>
					{label} ({symbol})
				</h2>
				<span className={`presence-pill ${player.connected === false ? "offline" : "online"}`}>
					{presenceText}
				</span>
			</div>

			<input
				className="name-input"
				type="text"
				value={player.name}
				disabled={!isEditable || player.locked}
				onChange={(event) => onNameChange(symbol, event.target.value)}
				placeholder={`Name for ${label}`}
				maxLength={24}
				required
			/>

			<div className={`character-grid ${player.locked ? "grid-locked" : ""}`}>
				{CHARACTERS.map((character) => {
					const isSelected = player.characterId === character.id;
					const isTakenByOther = otherPlayer.locked && otherPlayer.characterId === character.id;

					return (
						<button
							key={character.id}
							type="button"
							className={`char-card ${isSelected ? "selected" : ""} ${isTakenByOther ? "taken" : ""}`}
							style={{ "--char-color": character.color }}
							onMouseEnter={() => {
								if (isEditable && !player.locked && !isTakenByOther) {
									playCardHover();
								}
							}}
							onClick={() => onCharacterSelect(symbol, character.id)}
							disabled={!isEditable || player.locked || isTakenByOther}
							aria-pressed={isSelected}
						>
							<img src={character.img} alt={character.name} className="char-img" />
							<span className="char-name">{character.name}</span>
						</button>
					);
				})}
			</div>

			<div className="player-selection-summary">
				<span>
					Selected fighter: <strong>{getCharacterById(player.characterId).name}</strong>
				</span>
			</div>

			<button
				type="button"
				className={`secondary-button lock-button ${player.locked ? "locked" : ""}`}
				onClick={() => onToggleLock(symbol)}
				disabled={!isEditable || !player.name.trim()}
			>
				{player.locked ? "Unlock" : "Lock In"}
			</button>
		</section>
	);
}

export default CharacterSelectPanel;
