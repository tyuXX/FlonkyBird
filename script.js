const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

//FX Sound effects and etc.
const flapSound = new Audio("sounds/flap.wav");
const hitSound = new Audio("sounds/hit.wav");
const scoreSound = new Audio("sounds/score.wav");

// Game over function
function gameover() {
  hitSound.play();
  clearInterval(updateInterval);
  gameOverText.style.display = "block";
  restartButton.style.display = "block";
}

// Get canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Game variables (relative to canvas size)
let birdX = canvasWidth / 2;
let birdY = canvasHeight / 2;
const birdRadius = canvasWidth * 0.03; // 3% of canvas width
let gravity = 1;
let birdVelocity = 0;
let score = 0;
let gamespeed = 0;

// Pipe variables (relative to canvas size)
const pipeWidth = canvasWidth * 0.2; // 10% of canvas width
const pipeGap = birdRadius * 8; // 8X Size of the bird
let pipes = [];

// UI elements
const gameOverText = document.createElement("div");
gameOverText.classList.add("game-over");
gameOverText.textContent = "Game Over!";
document.body.appendChild(gameOverText);

const restartButton = document.createElement("button");
restartButton.classList.add("restart-button");
restartButton.textContent = "Restart";
document.body.appendChild(restartButton);

const scoreDisplay = document.createElement("span");
scoreDisplay.classList.add("score");
document.body.appendChild(scoreDisplay);

const highScoreDisplay = document.createElement("span");
highScoreDisplay.classList.add("high-score");
document.body.appendChild(highScoreDisplay);

// Load high score from local storage (if available)
let highScore = localStorage.getItem("flappyBirdHighScore") || 0;
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Restart game on button click
restartButton.addEventListener("click", () => {
  restartButton.style.display = "none";
  gameOverText.style.display = "none";
  birdX = canvas.width / 2;
  birdY = canvas.height / 2;
  birdVelocity = 0;
  pipes = [];
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  updateInterval = setInterval(update, 40);
});

// Check for space key press (flap)
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    birdVelocity = birdRadius * -0.2 ; // Jump upwards
  }
});

//Gamestate updater
let updateInterval = setInterval(update, 40);

function generatePipe() {
  //Generate new pipe
  const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 1));
  const bottomHeight = Math.max(1, canvas.height - (topHeight + pipeGap));
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomHeight: bottomHeight,
  });
  score++;
  scoreDisplay.textContent = `Score: ${score}`; // Update score display
  if ((score % 10 === 0) & (gamespeed < 4)) {
    gamespeed++;
    clearInterval(updateInterval);
    updateInterval = setInterval(update, 40 - gamespeed);
  }

  // Check for new high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyBirdHighScore", highScore);
    highScoreDisplay.textContent = `High Score: ${highScore}`;
  }
}

function drawBird() {
  ctx.beginPath();
  ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.closePath();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    ctx.fillStyle = "#00f"; // Green for top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillStyle = "#f00"; // Red for bottom pipe
    ctx.fillRect(
      pipe.x,
      pipe.topHeight + pipeGap,
      pipeWidth,
      pipe.bottomHeight
    );

    pipe.x -= canvasWidth * 0.005; // Move pipe to the left

    // Check for collision
    if (
      birdX + birdRadius > pipe.x &&
      birdX - birdRadius < pipe.x + pipeWidth &&
      (birdY - birdRadius < pipe.topHeight ||
        birdY + birdRadius > pipe.topHeight + pipeGap)
    ) {
      gameover();
    }
  });
}

function update() {
  // Update bird position
  birdVelocity += gravity;
  birdY += birdVelocity;

  // Check for bottom collision
  if (birdY + birdRadius > canvas.height) {
    gameover();
  }

  // Check for top collision
  if (birdY - birdRadius < 0) {
    gameover();
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw game elements
  drawBird();
  drawPipes();

  // Add new pipes
  if (
    pipes.length === 0 ||
    pipes[pipes.length - 1].x < canvas.width - pipeWidth - canvasWidth * 0.15
  ) {
    generatePipe();
  }

  // Remove passed pipes
  pipes = pipes.filter((pipe) => pipe.x > 10);
}
