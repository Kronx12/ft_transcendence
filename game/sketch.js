
// ---- Screen size

screenWidth = 640*2
screenHeight = 360*2
speedfactor = screenWidth / 640

// ---- Racket size

racketWidth = screenWidth / 40
racketHeight = screenHeight / 5

// ---- Players locations

player1x = (screenWidth / 20) + racketWidth - (racketWidth / 2);
player1y = (screenHeight / 2) - (racketHeight / 2);
player1speed = 5 * speedfactor;

player2x = screenWidth - (screenWidth / 20) - racketWidth - (racketWidth / 2);
player2y = (screenHeight / 2) - (racketHeight / 2);
player2speed = 5 * speedfactor;

// ---- Ball

ballWidth = 15;

ballX = screenWidth / 2;
ballY = screenHeight / 2;

velocityX = 3 * speedfactor;
velocityY = 3 * speedfactor;

function setup() {
    createCanvas(screenWidth, screenHeight);
}

function update() {
    if (ballX + velocityX + ballWidth / 2 >= screenWidth ||
        ballX + velocityX - ballWidth / 2 <= 0 ||
        (ballX + velocityX - ballWidth / 2 <= player1x + racketWidth &&
         ballY + velocityY <= player1y + racketHeight &&
         ballY + velocityY >= player1y) ||
         (ballX + velocityX + ballWidth / 2 >= player2x &&
          ballY + velocityY <= player2y + racketHeight &&
          ballY + velocityY >= player2y))
        velocityX *= -1

    if (ballY + velocityY + ballWidth / 2 >= screenHeight ||
        ballY + velocityY - ballWidth / 2 <= 0)
        velocityY *= -1

    ballX += velocityX;
    ballY += velocityY;

    if (keyIsDown(90) && !keyIsDown(83)) {
        if (player1y > 0)
            player1y -= player1speed;
    } else if (keyIsDown(83) && !keyIsDown(90)) {
        if (player1y + racketHeight < screenHeight)
            player1y += player1speed;
    }

    if (keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
        if (player2y > 0)
            player2y -= player2speed;
    } else if (keyIsDown(DOWN_ARROW) && !keyIsDown(UP_ARROW)) {
        if (player2y + racketHeight < screenHeight)
            player2y += player2speed;
    }
}

function draw() {
    clear();
    background(color('#000'));
    update();
    let c = color('#fff');
    stroke(c);
    noFill();
    rect(player1x, player1y, racketWidth, racketHeight);
    rect(player2x, player2y, racketWidth, racketHeight);

    angle = 8

    lenxa = (screenWidth / angle) - (player1x + racketWidth);
    lenya = (screenHeight / 2) - player1y;
    line(player1x + racketWidth, player1y, player1x + racketWidth + lenxa / 5, player1y + lenya / 5);

    lenxb = (screenWidth / angle) - (player1x + racketWidth);
    lenyb = (screenHeight / 2) - (player1y + racketHeight);
    line(player1x + racketWidth, player1y + racketHeight, player1x + racketWidth + lenxb / 5, player1y + racketHeight + lenyb / 5);

    line(player1x + racketWidth + lenxa / 5, player1y + lenya / 5,
        player1x + racketWidth + lenxb / 5, player1y + racketHeight + lenyb / 5);

    if (player1y > screenHeight / 2) {
        lenx = (screenWidth / angle) - player1x;
        leny = (screenHeight / 2) - player1y;
        line(player1x, player1y, player1x + lenx / 5, player1y + leny / 5);
        line(player1x + lenx / 5, player1y + leny / 5,
            player1x + racketWidth + lenxa / 5, player1y + lenya / 5);
    }
    if (player1y + racketHeight < screenHeight / 2) {
        lenx = (screenWidth / angle) - player1x;
        leny = (screenHeight / 2) - (player1y + racketHeight);
        line(player1x, player1y + racketHeight, player1x + lenx / 5, player1y + racketHeight + leny / 5);
        line(player1x + lenx / 5, player1y + racketHeight + leny / 5,
            player1x + racketWidth + lenxb / 5, player1y + racketHeight + lenyb / 5);
    }
    circle(screenWidth / 2, screenHeight / 2, screenHeight / 4);
    line(screenWidth / 2, 0, screenWidth / 2, screenHeight / 2 - screenHeight / 8)
    line(screenWidth / 2, screenHeight, screenWidth / 2, screenHeight / 2 + screenHeight / 8)

    fill(c);
    circle(ballX, ballY, ballWidth);
}