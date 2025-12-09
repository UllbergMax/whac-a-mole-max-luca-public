//Poäng och tid
let score = 0;
let timeLeft = 15;
let timer = null;
let moleTimer = null;
let activeTile = null;

//spelare
let currentPlayer = "Guest";
const PLAYER_NAME_KEY = "playerName";

// Statistik för spelet
let hits = 0;
let misses = 0;
let totalMoles = 0;
let hasActiveMole = false;
let moleHit = false;

// DOM-referenser
const board = document.getElementById("game-board");
const scoreTxt = document.getElementById("score");
const timeTxt = document.getElementById("time");
const playerNameInput = document.getElementById("playerName");
const setPlayerBtn = document.getElementById("setPlayerBtn");
const currentPlayerSpan = document.getElementById("current-player");
const messageEl = document.getElementById("message");
const highscoreList = document.getElementById("highscores");

const rightHandBtn = document.getElementById("rightHandBtn");
const leftHandBtn = document.getElementById("leftHandBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const nav = document.getElementById("main-nav");
const sections = {
    profile: document.getElementById("profile"),
    game: document.getElementById("game"),
    highScore: document.getElementById("high-score")
};

// Visa rätt sektion och göm resten
function showSection(sectionKey) {

    // Ange namn
    if (sectionKey === "game" && !localStorage.getItem(PLAYER_NAME_KEY)) {
        messageEl.textContent = "Please set your player name before playing.";
        sectionKey = "profile";
    }

    // Toggle visibility
    Object.entries(sections).forEach(([key, el]) => {
        el.classList.toggle("hidden", key !== sectionKey);
    });
}

// Meny
const menuItems = [
    { key: "profile", label: "Profile" },
    { key: "game", label: "Game" },
    { key: "highScore", label: "Highscore" }
];

// Generera menyn
if (nav) {
    menuItems.forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item.label;
        btn.addEventListener("click", () => showSection(item.key));
        nav.appendChild(btn);
    });
}

// Vänster eller högerhänt

function setRightHanded() {
    board.classList.remove("left-handed");
    board.classList.add("right-handed");

    rightHandBtn.classList.add("active");
    leftHandBtn.classList.remove("active");
}

function setLeftHanded() {
    board.classList.remove("right-handed");
    board.classList.add("left-handed");

    leftHandBtn.classList.add("active");
    rightHandBtn.classList.remove("active");
}

//Lyssnare för knapparna
rightHandBtn.addEventListener("click", setRightHanded);
leftHandBtn.addEventListener("click", setLeftHanded);

// Sätt default till högerhänt
setRightHanded();

// Tiles

for (let i = 0; i < 9; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    board.appendChild(tile);
}

// Highscores

function saveHighScore(score) {
    const date = new Date().toLocaleString();
    const entry = {
        name: currentPlayer || "Guest",
        score: score,
        date: date
    };

    const stored = localStorage.getItem("highscores");
    const highscores = stored ? JSON.parse(stored) : [];

    highscores.push(entry);
    highscores.sort((a, b) => b.score - a.score);

    localStorage.setItem("highscores", JSON.stringify(highscores));
}

function listHighScore() {
    const stored = localStorage.getItem("highscores");
    const highscores = stored ? JSON.parse(stored) : [];

    highscoreList.innerHTML = "";

    highscores.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score} (${entry.date})`;
        highscoreList.appendChild(li);
    });
}

// Mullvad

function showMole() {
    const tiles = document.querySelectorAll(".tile");

    // Om det fanns en aktiv mullvad som inte blev klickad = MISS
    if (hasActiveMole) {
        if (!moleHit) {
            misses++;
            messageEl.textContent = "Miss!";
        }
        if (activeTile) {
            activeTile.innerHTML = "";
            activeTile = null;
        }
        hasActiveMole = false;
    }

    // Välj ny slumpmässig ruta
    const randomIndex = Math.floor(Math.random() * tiles.length);
    activeTile = tiles[randomIndex];

    // Ny mullvad = ny chans
    totalMoles++;
    moleHit = false;
    hasActiveMole = true;

    const mole = document.createElement("div");
    mole.className = "mole";

    mole.addEventListener("click", function () {
        // Skydda mot dubbelklick
        if (moleHit) return;

        moleHit = true;
        hits++;
        score++;
        scoreTxt.textContent = score;
        messageEl.textContent = "Hit!";

        if (activeTile) {
            activeTile.innerHTML = "";
            activeTile = null;
        }
        hasActiveMole = false;
    });

    activeTile.appendChild(mole);
}


// Läs in namn från localStorage
function loadPlayerFromStorage() {
    const storedName = localStorage.getItem(PLAYER_NAME_KEY);

    if (storedName) {
        currentPlayer = storedName;
        currentPlayerSpan.textContent = currentPlayer;
        messageEl.textContent = "Welcome back " + currentPlayer + "!";
    } else {
        currentPlayer = "Guest";
        currentPlayerSpan.textContent = currentPlayer;
        // Om man inte anger namn
    }
}

// Välj spelare + spara i localStorage
setPlayerBtn.addEventListener("click", function () {
    const name = playerNameInput.value.trim();
    if (name === "") {
        messageEl.textContent = "Please enter a name first.";
        return;
    }

    //Spara namne
    currentPlayer = name;
    currentPlayerSpan.textContent = currentPlayer;
    messageEl.textContent = "Good luck " + currentPlayer;

    // Spara i localStorage
    localStorage.setItem(PLAYER_NAME_KEY, currentPlayer);
});

// Start / reset

function startGame() {
    // Förhindra att spele inte startas 2 gånger
    if (timer !== null || moleTimer !== null) return;

    // Nollställ
    score = 0;
    timeLeft = 15;
    hits = 0;
    misses = 0;
    totalMoles = 0;
    hasActiveMole = false;
    moleHit = false;

    scoreTxt.textContent = score;
    timeTxt.textContent = timeLeft;
    messageEl.textContent = "";

    clearInterval(timer);
    clearInterval(moleTimer);

    if (activeTile) {
        activeTile.innerHTML = "";
        activeTile = null;
    }

    //Starta nedräkning
    timer = setInterval(function () {
        timeLeft--;
        timeTxt.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    //Starta mullvadens "uppdykande"
    moleTimer = setInterval(showMole, 800);
    showMole();
}

startBtn.addEventListener("click", startGame);

// Avsluta spelet
function endGame() {
    clearInterval(timer);
    clearInterval(moleTimer);
    timer = null;
    moleTimer = null;

    if (activeTile) {
        activeTile.innerHTML = "";
        activeTile = null;
    }
    hasActiveMole = false;

    const accuracy = totalMoles > 0
        ? Math.round((hits / totalMoles) * 100)
        : 0;

    // Spara i highscore-listan
    saveHighScore(score);
    listHighScore();

    messageEl.textContent =
        `${currentPlayer} got ${hits} hits, ${misses} misses (${accuracy}% hits, score: ${score})`;
}

// Reset spelet
function resetGame() {
    clearInterval(timer);
    clearInterval(moleTimer);
    timer = null;
    moleTimer = null;

    timeLeft = 15;
    score = 0;
    hits = 0;
    misses = 0;
    totalMoles = 0;
    hasActiveMole = false;
    moleHit = false;

    scoreTxt.textContent = score;
    timeTxt.textContent = timeLeft;
    messageEl.textContent = "";

    if (activeTile) {
        activeTile.innerHTML = "";
        activeTile = null;
    }
}

resetBtn.addEventListener("click", resetGame);


loadPlayerFromStorage();
listHighScore();

// Startläge: om namn finns = gå till spelet, annars till profil
if (localStorage.getItem(PLAYER_NAME_KEY)) {
    showSection("game");
} else {
    showSection("profile");
}
