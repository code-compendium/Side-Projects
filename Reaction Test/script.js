/* --- 1. DOM SELECTOREN --- */
const startBtn = document.querySelector("#startBtn");
const instruction = document.querySelector("#instruction");
const leftLight = document.querySelector("#left-light");
const rightLight = document.querySelector("#right-light");
const roundNumber = document.querySelector("#round-number");
const resultsList = document.querySelector("#results-list");
const averageScore = document.querySelector("#average-score");
const averageWrong = document.querySelector("#average-wrong");
const averageTooEarly = document.querySelector("#average-too-early");
const resultsTitle = document.querySelector("#results-title");
const playerNameInput = document.querySelector("#player-name");

/* --- 2. GAME STATE & CONFIG --- */
const maxRounds = 10;
const validKeys = {
	ArrowLeft: "left",
	ArrowRight: "right",
};

let startTime;
let direction;
let isWaiting = false;
let timeoutId;
let roundActive = false;
let currentRound = 1;
let history = [];
let playerName = "";

// Initialiseer de ronde-teller bij het laden
roundNumber.textContent = `Ronde: ${currentRound}/${maxRounds}`;

/* --- 3. KERN GAME FUNCTIES --- */
function startGame() {
	resetGame();
	playerName = playerNameInput.value || "Anonymous Player";
	playerNameInput.disabled = true;
	startBtn.disabled = true;
	startRound();
}

function startRound() {
	roundActive = true;
	isWaiting = true;
	instruction.textContent = "Wait...";

	// Zet stoplichten terug op rood
	leftLight.src = "images/red-traffic-light.svg";
	rightLight.src = "images/red-traffic-light.svg";
	direction = null;
	startTime = null;

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

/* --- 4. ACTION & FEEDBACK FUNCTIES --- */
function flashEffect(className) {
	document.body.classList.remove("error-flash", "success-flash");
	void document.body.offsetWidth; // Forceer reflow voor herhaalde animaties
	document.body.classList.add(className);
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

function resetGame() {
	leftLight.src = "images/red-traffic-light.svg";
	rightLight.src = "images/red-traffic-light.svg";
	instruction.textContent = "Press start";
	startBtn.textContent = "Start";
	currentRound = 1;
	roundNumber.textContent = `Ronde: ${currentRound}/${maxRounds}`;
	history = [];
	resultsList.innerHTML = "";
	averageScore.textContent = "";
	averageWrong.textContent = "";
	averageTooEarly.textContent = "";
	startTime = null;
	direction = null;
}

/* --- 5. STATISTIEKEN & RESULTATEN --- */
function endGame() {
	instruction.textContent = "Game over!";
	startBtn.textContent = "Play again";
	startBtn.disabled = false;
	playerNameInput.disabled = false;
	resultsTitle.textContent = `${playerName}'s Results`;

	resultsList.innerHTML = "";
	history.forEach((round) => {
		const displayTime = round.tijd === "-" ? "-" : round.tijd + " ms";
		const li = document.createElement("li");
		li.textContent = `Ronde ${round.ronde}: ${round.uitslag} (${displayTime})`;
		resultsList.appendChild(li);
	});

	// Bereken gemiddelden
	const goedeRondes = history.filter((round) => round.uitslag === "Goed");
	const fouteRondes = history.filter((round) => round.uitslag === "Fout");
	const vroegeRondes = history.filter((round) => round.uitslag === "Te vroeg");

	let average = 0;
	if (goedeRondes.length > 0) {
		average = Math.round(
			goedeRondes.reduce((acc, round) => acc + round.tijd, 0) / goedeRondes.length,
		);
	}

	let gemiddeldeFout = 0;
	if (fouteRondes.length > 0) {
		gemiddeldeFout = Math.round(
			fouteRondes.reduce((acc, round) => acc + round.tijd, 0) / fouteRondes.length,
		);
	}

	averageScore.textContent = `Gemiddelde reactietijd: ${average} ms`;
	averageWrong.textContent = `Gemiddelde foute reactietijd: ${gemiddeldeFout} ms`;
	averageTooEarly.textContent = `Aantal keer te vroeg gedrukt: ${vroegeRondes.length}`;
}

/* --- 6. EVENT LISTENERS --- */
startBtn.addEventListener("click", startGame);

playerNameInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.stopPropagation();
		if (!isWaiting && !startTime) {
			startGame();
		}
	}
});

document.addEventListener("keydown", (event) => {
	if (!roundActive) return;
	if (event.repeat) return;

	const playerChoice = validKeys[event.key];
	if (!isWaiting && !startTime) return;

	// Te vroeg geklikt
	if (isWaiting) {
		clearTimeout(timeoutId);
		isWaiting = false;
		roundActive = false;
		instruction.textContent = "Too early!";
		history.push({ ronde: currentRound, uitslag: "Te vroeg", tijd: "-" });
		flashEffect("error-flash");
		finishRound();
		return;
	}

	// Geldige reactie (Goed of Fout)
	const reactionTime = Date.now() - startTime;
	if (playerChoice === direction) {
		roundActive = false;
		instruction.textContent = `Reaction time: ${reactionTime} ms`;
		history.push({ ronde: currentRound, uitslag: "Goed", tijd: reactionTime });
		flashEffect("success-flash");
		finishRound();
		startTime = null;
		return;
	}

	if (playerChoice && playerChoice !== direction) {
		roundActive = false;
		instruction.textContent = "Wrong key!";
		history.push({ ronde: currentRound, uitslag: "Fout", tijd: reactionTime });
		flashEffect("error-flash");
		finishRound();
		return;
	}
});
