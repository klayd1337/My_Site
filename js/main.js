import { GameView, clickToTile, animateMove, canvas } from "./gameview.js";
import {
  move,
  isSolved,
  generatePuzzle,
  copyState,
  isEqual,
  findZero,
} from "./game.js";

const movesDisplay = document.getElementById("movesDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const messageDisplay = document.getElementById("messageDisplay");

let currentState = generatePuzzle();
let moves = 0;
let isGameSolved = false;
let initialGameState = copyState(currentState);
let animating = false;

function updateUI() {
  movesDisplay.textContent = moves;
  if (isGameSolved) {
    statusDisplay.textContent = "✅ Решено!";
    statusDisplay.style.color = "#60c060";
  } else {
    statusDisplay.textContent = "🔄 Игра";
    statusDisplay.style.color = "#60c060";
  }
}

function showMessage(text, type = "info") {
  messageDisplay.textContent = text;
  messageDisplay.className = "game-status " + type;
}

function makeMove(row, col) {
  if (animating || isGameSolved) return;

  const newState = move(currentState, row, col);
  if (isEqual(newState, currentState)) {
    showMessage(
      "❌ Неверный ход! Кликните на плитку рядом с пустым местом",
      "error",
    );
    return;
  }

  const prevState = copyState(currentState);
  currentState = newState;
  moves++;
  updateUI();

  animateMove(prevState, currentState, () => {
    if (isSolved(currentState)) {
      isGameSolved = true;
      updateUI();
      new GameView(currentState, true);
      showMessage("🎉 Поздравляю! Головоломка решена!", "success");
    } else {
      showMessage(`👍 Ход ${moves}`, "info");
    }
  });
}

function shuffle() {
  if (animating) return;
  currentState = generatePuzzle();
  moves = 0;
  isGameSolved = false;
  initialGameState = copyState(currentState);
  updateUI();
  new GameView(currentState);
  showMessage("🎲 Поле перемешано! Попробуйте решить", "info");
}

function resetGame() {
  if (animating) return;
  currentState = copyState(initialGameState);
  moves = 0;
  isGameSolved = false;
  updateUI();
  new GameView(currentState);
  showMessage("↩️ Состояние сброшено", "info");
}

function newGame() {
  if (animating) return;
  currentState = generatePuzzle();
  moves = 0;
  isGameSolved = false;
  initialGameState = copyState(currentState);
  updateUI();
  new GameView(currentState);
  showMessage("🔄 Новая игра! Удачи!", "info");
}

canvas.addEventListener("click", (e) => {
  const [row, col] = clickToTile(e.clientX, e.clientY);
  if (row >= 0 && row < 3 && col >= 0 && col < 3) {
    makeMove(row, col);
  }
});

canvas.addEventListener("mousemove", (e) => {
  const [row, col] = clickToTile(e.clientX, e.clientY);
  if (
    row >= 0 &&
    row < 3 &&
    col >= 0 &&
    col < 3 &&
    currentState[row][col] !== 0
  ) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }
});

document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("shuffleBtn").addEventListener("click", shuffle);
document.getElementById("resetBtn").addEventListener("click", resetGame);

document.addEventListener("keydown", (e) => {
  const zero = findZero(currentState);
  let targetRow = zero[0];
  let targetCol = zero[1];

  switch (e.key) {
    case "ArrowUp":
      targetRow = zero[0] + 1;
      break;
    case "ArrowDown":
      targetRow = zero[0] - 1;
      break;
    case "ArrowLeft":
      targetCol = zero[1] + 1;
      break;
    case "ArrowRight":
      targetCol = zero[1] - 1;
      break;
    case "r":
    case "R":
      shuffle();
      return;
    default:
      return;
  }

  e.preventDefault();
  if (targetRow >= 0 && targetRow < 3 && targetCol >= 0 && targetCol < 3) {
    makeMove(targetRow, targetCol);
  }
});

new GameView(currentState);
updateUI();
showMessage("💡 Нажмите на плитку рядом с пустым местом", "info");
