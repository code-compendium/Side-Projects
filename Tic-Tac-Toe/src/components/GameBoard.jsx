import { useEffect, useRef, useState } from "react";
import { getCellAriaLabel } from "../lib/gameLogic";

function clampIndex(index) {
	if (index < 0) return 8;
	if (index > 8) return 0;
	return index;
}

function GameBoard({
	board,
	players,
	onSelect,
	isDisabled,
	canContinueRound = false,
	onContinueRound,
	focusSignal = 0,
}) {
	const [focusedIndex, setFocusedIndex] = useState(() => {
		const firstOpenCell = board.findIndex((cell) => cell === null);
		return firstOpenCell >= 0 ? firstOpenCell : 0;
	});
	const buttonRefs = useRef([]);
	const boardRef = useRef(board);

	useEffect(() => {
		boardRef.current = board;
	}, [board]);

	useEffect(() => {
		buttonRefs.current[focusedIndex]?.focus();
	}, [focusedIndex]);

	useEffect(() => {
		const firstOpenCell = boardRef.current.findIndex((cell) => cell === null);
		if (firstOpenCell >= 0) {
			buttonRefs.current[firstOpenCell]?.focus();
		}
	}, [focusSignal]);

	const moveFocus = (nextIndex) => {
		setFocusedIndex(clampIndex(nextIndex));
	};

	const handleKeyDown = (event, index) => {
		if ((event.key === "Enter" || event.key === " ") && canContinueRound && onContinueRound) {
			event.preventDefault();
			onContinueRound();
			return;
		}

		if (isDisabled) {
			if (
				event.key === "ArrowRight" ||
				event.key === "ArrowLeft" ||
				event.key === "ArrowDown" ||
				event.key === "ArrowUp" ||
				event.key === "Home" ||
				event.key === "End" ||
				event.key === "Enter" ||
				event.key === " "
			) {
				event.preventDefault();
			}
			return;
		}

		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				moveFocus(index + 1);
				return;
			case "ArrowLeft":
				event.preventDefault();
				moveFocus(index - 1);
				return;
			case "ArrowDown":
				event.preventDefault();
				moveFocus(index + 3);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveFocus(index - 3);
				return;
			case "Home":
				event.preventDefault();
				moveFocus(0);
				return;
			case "End":
				event.preventDefault();
				moveFocus(8);
				return;
			case "Enter":
			case " ":
				event.preventDefault();
				if (canContinueRound && onContinueRound) {
					onContinueRound();
					return;
				}
				onSelect(index);
				return;
			default:
				return;
		}
	};

	return (
		<div
			className={`board ${isDisabled ? "disabled" : ""}`}
			role="grid"
			aria-label="Tic-Tac-Toe board"
		>
			{board.map((cell, index) => {
				const owner = cell ? players[cell] : null;
				const isCellDisabled = isDisabled || Boolean(cell);
				const canReceiveKeyboardFocus = canContinueRound || !isDisabled;

				return (
					<button
						key={index}
						ref={(element) => {
							buttonRefs.current[index] = element;
						}}
						type="button"
						role="gridcell"
						tabIndex={canReceiveKeyboardFocus && focusedIndex === index ? 0 : -1}
						className={`square ${cell ? "filled" : ""}`}
						style={{
							color: owner ? owner.character.color : "#d8d2c8",
							textShadow: owner ? `0 0 14px ${owner.character.shadow}` : "none",
						}}
						aria-label={getCellAriaLabel(index, cell)}
						aria-disabled={isCellDisabled}
						onClick={() => onSelect(index)}
						onFocus={() => {
							if (!isDisabled) {
								setFocusedIndex(index);
							}
						}}
						onKeyDown={(event) => handleKeyDown(event, index)}
					>
						{cell ?? ""}
					</button>
				);
			})}
		</div>
	);
}

export default GameBoard;
