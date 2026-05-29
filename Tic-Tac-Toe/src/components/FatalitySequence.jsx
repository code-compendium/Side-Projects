import { KEY_LABELS } from "../constants/game";

function FatalitySequence({ fatality }) {
	if (!fatality.active || fatality.result) return null;

	return (
		<div className="fatality-sequence" aria-label="Fatality sequence">
			{fatality.sequence.map((key, index) => (
				<span
					key={`${key}-${index}`}
					className={`combo-key ${index < fatality.progress ? "done" : ""} ${index === fatality.progress ? "active" : ""}`}
				>
					{KEY_LABELS[key]}
				</span>
			))}
		</div>
	);
}

export default FatalitySequence;
