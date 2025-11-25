let intervalId;
let activeIndex = null;

function startGame() {
    intervalId = setInterval(() => {
        // slumpa bild
        const moles = document.querySelectorAll(".mole");
        if (activeIndex !== null) {
            moles[activeIndex].src = "media/mole-hill.png";
        }
        activeIndex = Math.floor(Math.random() * moles.length);
        moles[activeIndex].src = "media/mole-head.png";
    }, 1000);
}

document.getElementById("start-btn")
    .addEventListener("click", startGame);



setTimeout(endGame, gameTime);

function endGame() {
    clearInterval(intervalId);

    let score = Math.round((hits / (hits + misses)) * 100);

    alert(`Träffar: ${hits}, Missar: ${misses}, Poäng: ${score}%`);

    saveHighScore(score); // Del 3

    // reset
    hits = 0;
    misses = 0;
    activeIndex = null;
}

// highscore.js
function saveHighScore(score) {
    const name = localStorage.getItem("playerName");

    const entry = {
        name: name,
        score: score,
        date: new Date().toLocaleString()
    };

    let list = JSON.parse(localStorage.getItem("highscores")) || [];
    list.push(entry);

    list.sort((a, b) => b.score - a.score);

    localStorage.setItem("highscores", JSON.stringify(list));
}