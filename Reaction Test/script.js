const startBtn = document.getElementById("startBtn");
const instruction = document.getElementById("instruction");
const leftLight = document.getElementById("left-light");
const rightLight = document.getElementById("right-light");

let startTime;
let direction;
let isWaiting = false;
let timeoutId;

startBtn.addEventListener("click", startGame);

function startGame() {
	resetGame();
	isWaiting = true;
	instruction.textContent = "Wait...";

	const delay = Math.random() * 3000 + 1000;

	timeoutId = setTimeout(turnGreen, delay);
}

function turnGreen() {
	isWaiting = false;
	direction = Math.random() > 0.5 ? "left" : "right";

	if (direction === "left") {
		leftLight.src = "images/green-traffic-light.svg";
	} else {
		rightLight.src = "images/green-traffic-light.svg";
	}

	startTime = Date.now();
}

function resetGame() {
	leftLight.src = "images/red-traffic-light.svg";
	rightLight.src = "images/red-traffic-light.svg";
	instruction.textContent = "Press start";
	startTime = null;
	direction = null;
}

const validKeys = {
	ArrowLeft: "left",
	ArrowRight: "right",
};

document.addEventListener("keydown", (event) => {
	const playerChoice = validKeys[event.key];
	if (!isWaiting && !startTime) return;
	if (isWaiting) {
		clearTimeout(timeoutId);
		isWaiting = false;
		instruction.textContent = "Too early!";
		return;
	}
	if (playerChoice === direction) {
		const reactionTime = Date.now() - startTime;

		instruction.textContent = `Reaction time: ${reactionTime} ms`;

		startTime = null;
	} else if (playerChoice) {
		instruction.textContent = "Wrong key!";
		startTime = null;
	}
});
