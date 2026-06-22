import { createGame } from "./game.js";
import { runShow } from "./show.js";

const titleEl = document.getElementById("game-title");
const statusEl = document.getElementById("game-status");
const gameBoardEl = document.getElementById("game-board");
const screenGame = document.getElementById("screen-game");
const screenShow = document.getElementById("screen-show");
const screenItinerary = document.getElementById("screen-itinerary");

document.getElementById("replay").addEventListener("click", () => location.reload());
document.getElementById("see-itinerary").addEventListener("click", showItinerary);
document.getElementById("skip").addEventListener("click", handleWin); // hidden testing shortcut

createGame({
  mount: gameBoardEl,
  titleEl,
  statusEl,
  onWin: handleWin,
});

let winStarted = false;
function handleWin() {
  if (winStarted) return; // run the win sequence only once (real win or skip)
  winStarted = true;
  titleEl.textContent = "You're getting quite good at this! Check out this new opening I just learned.";
  titleEl.classList.add("win-line");
  statusEl.textContent = "";

  // Let the line land, then dissolve the game and roll the finale.
  setTimeout(() => {
    screenGame.classList.add("fade-out");
    setTimeout(() => {
      screenGame.classList.add("hidden");
      screenShow.classList.remove("hidden");
      runShow();
    }, 900);
  }, 2600);
}

// "See Itinerary" — clear the boards and reveal the date plan.
function showItinerary() {
  screenShow.classList.add("fade-out");
  setTimeout(() => {
    screenShow.classList.add("hidden");
    screenItinerary.classList.remove("hidden");
    requestAnimationFrame(() => screenItinerary.classList.add("revealed"));
  }, 700);
}
