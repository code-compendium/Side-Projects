const startBtn = document.getElementById("startBtn");
const instruction = document.getElementById("instruction");

let startTime;
let direction;

startBtn.addEventListener("click", startGame);

function startGame() {
	instruction.textContent = "Wait...";

	const delay = Math.random() * 2000 + 1000;

	setTimeout(showArrow, delay);
}

function showArrow() {
	direction = Math.random() > 0.5 ? "left" : "right";

	instruction.textContent = direction === "left" ? "←" : "→";

	startTime = Date.now();
}

document.addEventListener("keydown", (event) => {
	if (!startTime) return;

	if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
		const reactionTime = Date.now() - startTime;

		instruction.textContent = `Reaction time: ${reactionTime} ms`;

		startTime = null;
	}
});
