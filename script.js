const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const startButton = document.getElementById('start-button');
const gameOverMessage = document.getElementById('game-over');

const gridSize = 20; // Size of each grid cell (and snake segment/food)
let tileCountX; // Number of tiles in X direction
let tileCountY; // Number of tiles in Y direction

let snake;
let food;
let dx; // Horizontal velocity
let dy; // Vertical velocity
let score;
let highScore;
let gameInterval;
let gameActive = false;

// --- Game Setup and Initialization ---

function setupCanvas() {
    // Make canvas responsive to a degree, but fixed grid size is simpler for snake
    const containerWidth = document.querySelector('.game-container').offsetWidth - 40; // Account for padding
    const maxWidth = 600;
    const maxHeight = 400;

    canvas.width = Math.min(containerWidth, maxWidth) - (Math.min(containerWidth, maxWidth) % gridSize);
    canvas.height = Math.min(maxHeight, maxHeight) - (Math.min(maxHeight, maxHeight) % gridSize);

    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;
}


function initializeGame() {
    snake = [
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) } // Start in the middle
    ];
    dx = 1; // Initial movement to the right
    dy = 0;
    score = 0;
    currentScoreEl.textContent = score;
    gameOverMessage.style.display = 'none';
    placeFood();
    gameActive = true;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 200); // Adjust speed here (milliseconds)
}

function loadHighScore() {
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreEl.textContent = highScore;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
}

// --- Game Logic ---

function gameLoop() {
    if (!gameActive) return;

    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    checkCollision();
}

function clearCanvas() {
    ctx.fillStyle = '#eee'; // Background color of the canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY)
    };

    // Ensure food doesn't spawn on the snake
    for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            placeFood(); // Recursively try again
            return;
        }
    }
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = '#darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'darkgreen';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        score++;
        currentScoreEl.textContent = score;
        placeFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function checkCollision() {
    const head = snake[0];

    // Collision with walls
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        endGame();
        return;
    }

    // Collision with self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    saveHighScore();
    gameOverMessage.style.display = 'block';
    startButton.textContent = "Play Again"; // Or "Restart Game"
}

// --- Event Listeners ---

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((keyPressed === 'ArrowLeft' || keyPressed.toLowerCase() === 'a') && !goingRight) {
        dx = -1;
        dy = 0;
    } else if ((keyPressed === 'ArrowUp' || keyPressed.toLowerCase() === 'w') && !goingDown) {
        dx = 0;
        dy = -1;
    } else if ((keyPressed === 'ArrowRight' || keyPressed.toLowerCase() === 'd') && !goingLeft) {
        dx = 1;
        dy = 0;
    } else if ((keyPressed === 'ArrowDown' || keyPressed.toLowerCase() === 's') && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    setupCanvas(); // Set canvas size based on container first
    loadHighScore();
    // Draw initial state (optional, could be a welcome screen)
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    // ctx.fillText('Press Start Game', canvas.width / 2, canvas.height / 2);

    startButton.addEventListener('click', () => {
        initializeGame();
        startButton.textContent = "Start Game"; // Reset button text if it was "Play Again"
    });
    document.addEventListener('keydown', changeDirection);
});

// Ensure canvas is resized if window size changes (optional, can be complex with fixed grid)
window.addEventListener('resize', () => {
    // Basic resize handling: could clear and ask to restart or try to adapt
    // For simplicity, this might require a game restart to recalibrate grid
    if (!gameActive) { // Only allow resize adjustments if game is not running
        setupCanvas();
        // Optionally redraw a placeholder message if game hasn't started
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        // ctx.fillText('Canvas Resized. Press Start Game.', canvas.width / 2, canvas.height / 2);
    }
});
