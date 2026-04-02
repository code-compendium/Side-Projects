const startBtn = document.getElementById("startBtn");
const instruction = document.getElementById("instruction");
const leftLight = document.getElementById("left-light");
const rightLight = document.getElementById("right-light");
const roundNumber = document.getElementById("round-number");
const resultsList = document.getElementById("results-list");
const averageScore = document.getElementById("average-score");

let startTime;
let direction;
let isWaiting = false;
let timeoutId;
let currentRound = 1;
const maxRounds = 10;
let history = [];

startBtn.addEventListener("click", startGame);

function startGame() {
	startBtn.disabled = true;
	resetGame();
	startRound();
}

function startRound() {
	isWaiting = true;
	instruction.textContent = "Wait...";
	const delay = Math.random() * 3000 + 1000;
	leftLight.src = "images/red-traffic-light.svg";
	rightLight.src = "images/red-traffic-light.svg";
	direction = null;
	startTime = null;

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
	startBtn.textContent = "Start";
	currentRound = 1;
	history = [];
	startTime = null;
	direction = null;
}

function endGame() {
	instruction.textContent = "Game over!";
	startBtn.textContent = "Play again";
	startBtn.disabled = false;
	resultsList.innerHTML = "";
	history.forEach((round) => {
		const li = document.createElement("li");
		li.textContent = `Ronde ${round.ronde}: ${round.uitslag} (${round.tijd} ms)`;
		resultsList.appendChild(li);
	});
	const goodReactionTimes = history.filter((round) => round.tijd !== null);
	averageScore.textContent = `Gemiddelde reactietijd: ${Math.round(goodReactionTimes.reduce((acc, round) => acc + round.tijd, 0) / goodReactionTimes.length)} ms`;
}

function finishRound() {
	if (currentRound === maxRounds) {
		endGame();
		return;
	}
	currentRound++;
	roundNumber.textContent = `Ronde: ${currentRound}/${maxRounds}`;
	setTimeout(startRound, 1500);
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
		history.push({ ronde: currentRound, uitslag: "Te vroeg", tijd: null });
		finishRound();
		return;
	}
	if (playerChoice === direction) {
		const reactionTime = Date.now() - startTime;

		instruction.textContent = `Reaction time: ${reactionTime} ms`;
		history.push({ ronde: currentRound, uitslag: "Goed", tijd: reactionTime });
		finishRound();
		startTime = null;
		return;
	}
	if (playerChoice) {
		instruction.textContent = "Wrong key!";
		history.push({ ronde: currentRound, uitslag: "Fout", tijd: null });
		finishRound();
		return;
	}
});
