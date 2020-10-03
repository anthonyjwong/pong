const canvas = document.getElementById('canvas');

// need contet to be able to draw on canvas
const context = canvas.getContext('2d');

let running = false;

let paddleHitSound = new Audio('sounds/beep1.wav');
let wallHitSound = new Audio('sounds/beep2.wav');
let roundOverSound = new Audio('sounds/beep3.wav');

const color = ["#1abc9c", "#2ecc71", "#3498db", "#e74c3c", "#9b59b6"];

const netWidth = 4;
const netHeight = canvas.height;

const paddleWidth = 10;
const paddleHeight = 100;

const ballSize = 18;

let upKeyPressed = false;
let downKeyPressed = false;
let upKeyPressedAI= false;
let downKeyPressedAI = false;

const net = {
    x: canvas.width / 2 - netWidth / 2,
    y: 0,
    width: netWidth,
    height: netHeight,
    color: '#ffffff'
};

const user = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#ffffff',
    score: 0,
    speed: 8
};

const ai = {
    x: canvas.width - (paddleWidth + 10),
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#ffffff',
    score: 0,
    speed: 8
};

const ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    width: ballSize,
    height: ballSize,
    velX: 5,
    velY: 5,
    color: '#ffffff',
    speed: 7
};

function drawNet() {
  context.fillStyle = net.color;
  context.beginPath();

  context.setLineDash([7, 15]); // setLineDash(dash_thickness, spacing)
  context.moveTo(canvas.width / 2 + 10, canvas.height - 60);
  context.lineTo(canvas.width / 2 + 10, 100);
  context.lineWidth = 10;
  context.strokeStyle = net.color;
  context.stroke();
}

function drawScore(x, y, score) {
    context.fillStyle = '#ffffff';
    context.font = '30px Monaco';

    context.fillText(score, x, y);
}

function drawPaddle(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function drawBall(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function drawMenu() {
    context.fillStyle = '#2c3e50';
    context.fillRect(canvas.width / 2 - 350, canvas.height / 2 - 50, 700, 100);

    context.fillStyle = '#ffffff';
    context.font = '40px Monaco';
    context.fillText('press any key to begin', canvas.width / 5 + 3, canvas.height / 2 + 10);
}

function collisionDetect(player, ball) {
    player.top = player.y
    player.right = player.x + player.width;
    player.bottom = player.y + player.height;
    player.left = player.x;

    ball.top = ball.y;
    ball.right = ball.x + ball.width;
    ball.bottom = ball.y + ball.height;
    ball.left = ball.x;

    return ball.left < player.right && ball.top < player.bottom && ball.bottom > player.top && ball.right > player.left;
}

// draws everything on to canvas
function render() {
    context.fillStyle = '#2c3e50';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawNet();

    // draw scores for player and ai
    drawScore(canvas.width / 4, canvas.height / 6, user.score);
    drawScore(3 * canvas.width / 4, canvas.height / 6, ai.score);

    // draw paddles for player and ai
    drawPaddle(user.x, user.y, user.width, user.height, user.color);
    drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);

    drawBall(ball.x, ball.y, ball.width, ball.height, ball.color);

    if (running === false) {
        drawMenu();
    }
}

function update() {
  // move ball
  ball.x += ball.velX;
  ball.y += ball.velY;

  /* ball collision */
  // if ball hits top or bottom wall
  if (ball.y + ball.height >= canvas.height || ball.y - ball.height <= 0) {
    //wallHitSound.play();
    ball.velY = -ball.velY;
  }

  // if ball hits either paddle
  let player = ball.x < canvas.width / 2 ? user : ai;
  if (collisionDetect(player, ball)) {
    paddleHitSound.play();

    let angle = 0;

    // if (ball.y < player.y + (1 / 4) * player.height) {
    //   angle = (-1 * 3 * Math.PI) / 8;
    // } else 
    if (ball.y < player.y + (1 / 2) * player.height) {
      angle = (-1 * Math.PI) / 4;
    // } else if (ball.y > player.y + (3 / 4) * player.height) {
    //   angle = (3 * Math.PI) / 8;
    }
    else if (ball.y > player.y + (1 / 2) * player.height) {
      angle = Math.PI / 4;
    }

    ball.velX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
    ball.velY = ball.speed * Math.sin(angle);

    ball.speed += 0.2;
    context.fillStyle = color[Math.floor(color.length * Math.random())];
  }

  // if user scores
  if (ball.x + ball.width >= canvas.width) {
    roundOverSound.play();
    user.score += 1;
    reset();
  }

  // if ai scores
  if (ball.x <= 0) {
    roundOverSound.play();
    ai.score += 1;
    reset();
  }

  // move player paddle
  if (upKeyPressed && user.y > 10) {
    user.y -= user.speed;
  }
  else if (downKeyPressed && user.y < canvas.height - user.height - 10) {
    user.y += user.speed;
  }

  // move ai paddle single player
  // ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.09;
  // multiplayer version
  if (upKeyPressedAI && ai.y > 10) {
    ai.y -= ai.speed;
  } 
  else if (downKeyPressedAI && ai.y < canvas.height - ai.height - 10) {
    ai.y += ai.speed;
  }

  // paddle collision detection
  collisionDetect(user, ball);
  collisionDetect(ai, ball);
}

function reset() {
    // reset ball position
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;

    // change direction of the ball
    ball.velX = -ball.velX;
    ball.velY = -ball.velY;
}

function gameLoop() {
    if (running === true) {
        update();
    }
    
    render();
}

window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

function keyDownHandler(event) {
    if (running === false) {
        running = true;
        wallHitSound.play();
    }

    switch (event.keyCode) {
        // up arrow and w key
        case 38:
            upKeyPressedAI = true;
            break;
        case 87:
            upKeyPressed = true;
            break;

        // down arrow and s key
        case 40:
            downKeyPressedAI = true;
            break;
        case 83:
            downKeyPressed = true;
            break;
            
    }
}

function keyUpHandler(event) {
    switch (event.keyCode) {
        // up arrow and w key
        case 38:
            upKeyPressedAI = false;
            break;
        case 87:
            upKeyPressed = false;
            break;

        // down arrow and s key
        case 40:
            downKeyPressedAI = false;
            break;
        case 83:
            downKeyPressed = false;
            break;
    }
}

// calls gameLoop() 60 times per second aka set game to run at 60 fps
setInterval(gameLoop, 1000 / 60);