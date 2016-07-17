"use strict";

let game = new MicroCanvas();

// Graphics assets
let rjs, rjsLogo, dino, dinoEek, dinoLegs, dinoKaput, clouds, cactus;

// Sound assets
let sfxBling, sfxPlop, sfxBoing, sfxEek, sfxBust;

// Game state globals
const S_INTRO = 1;
const S_PLAYING = 2;
const S_GAMEOVER = 3;

// Other globals and constants
const START_SPEED = 75;

let baseline, baselineDino;



// Setup phase
// Load assets, preconfigure globals, set up microcanvas subsystem
game.setup(function(game) {
  rjs = game.loadGraphics(
    `PROGMEM const unsigned char rjs[] = { /*77x15*/
       0xfe, 0x01, 0xfe, 0x02, 0x85, 0x85, 0x05, 0xc5, 0xb9, 0xc2, 0x3c, 0x00, 0x00, 0x00,
       0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x00,
       0xfe, 0x01, 0x7e, 0x40, 0x40, 0x40, 0x40, 0x80, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00,
       0x00, 0xfe, 0x01, 0xfe, 0x02, 0x85, 0x85, 0x05, 0xc5, 0xbb, 0xc6, 0x7c, 0x00, 0x00,
       0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x1c, 0x26, 0x5a, 0x97
       0xa0, 0xa3, 0xa5, 0x45, 0xcb, 0x8a, 0x0c, 0x3f, 0x40, 0x3f, 0x01, 0x02, 0x05,
       0x0b, 0x16, 0x2c, 0x58, 0x30, 0x00, 0x00, 0x00, 0x01, 0x1b, 0x29, 0x28, 0x50, 0x50,
       0x50, 0x28, 0x27, 0x18, 0x07, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x40, 0x3f, 0x01,
       0x01, 0x01, 0x01, 0x00, 0x3f, 0x40, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x40, 0x3f,
       0x01, 0x02, 0x05, 0x0b, 0x16, 0x2c, 0x58, 0x30, 0x00, 0x00, 0x20, 0x50, 0x50, 0x28,
       0x27, 0x10, 0x0f, 0x00, 0x00, 0x00, 0x0c, 0x14, 0x2c, 0x28, 0x50, 0x50, 0x60,
       0x1b, 0x34, 0x39, 0x0f };`
  );

  rjsLogo = game.loadGraphics(
    `PROGMEM const unsigned char rjs_logo[] = { /*39x36*/
      0x00, 0x00, 0x00, 0x00, 0xc0, 0x60, 0xb0, 0x50, 0x28, 0x2c, 0x14, 0x8a, 0x8a,
      0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5,
      0xa5, 0x8a, 0x8a, 0x14, 0x2c, 0x28, 0x50, 0xb0, 0x60, 0xc0, 0x00, 0x00,
      0x00, 0x00, 0xc0, 0x38, 0xc6, 0x3b, 0x04, 0x03, 0x00, 0x00, 0x00, 0x00, 0xc1,
      0x62, 0x32, 0xfa, 0x0a, 0xfa, 0x32, 0x62, 0x42, 0x02, 0x42, 0x62, 0x32, 0xfa,
      0x0a, 0xfa, 0x32, 0x62, 0xc1, 0x00, 0x00, 0x00, 0x00, 0x03, 0x04, 0x3b, 0xc6, 0x38,
      0xc0, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x83, 0x70,
      0x8f, 0x70, 0x0d, 0x05, 0x7d, 0x7d, 0x05, 0x7d, 0x7d, 0x05, 0x0d, 0x70, 0x8f,
      0x70, 0x83, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00,
      0x07, 0x18, 0x27, 0x5c, 0xb0, 0xe0, 0x00, 0xc0, 0x30, 0xce, 0x31, 0x0e, 0x01,
      0x00, 0x01, 0x01, 0xff, 0xff, 0x01, 0xff, 0xff, 0x01, 0x01, 0x00, 0x01, 0x0e, 0x31,
      0xce, 0x30, 0xc0, 0x00, 0xe0, 0xb0, 0x5c, 0x27, 0x18, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x0e, 0x09, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x06, 0x09, 0x0e,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };`
  );

  dino = game.loadGraphics(
    `PROGMEM const unsigned char dino[] = { /*20x24*/
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xfe, 0xff, 0xfb, 0xff, 0xff, 0xbf, 0xbf, 0xbf, 0x3f, 0x3e,
      0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff,
      0xff, 0xff, 0xff, 0x7f, 0x04, 0x0c, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x01, 0x03, 0x07, 0x7f, 0x5f, 0x0f, 0x07, 0x0f,
      0x7f, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    };`
  );

  dinoEek = game.loadGraphics(
    `PROGMEM const unsigned char dino_eek[] = { /*20x24*/
      0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0x00, 0xfe, 0xf5,
      0xfb, 0xb5, 0xdf,  0x5f, 0x5f, 0x5f,  0x1f, 0x1e, 0x7e,  0xf8, 0xf0, 0xe0,
      0xe0, 0xf0, 0xf8,  0xfc, 0xfe, 0xff,  0xff, 0xff, 0xff,  0x7f, 0x04, 0x0c,
      0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0x01, 0x03, 0x07,  0x7f, 0x5f, 0x0f,
      0x07, 0x0f, 0x7f,  0x43, 0x01, 0x00,  0x00, 0x00, 0x00,  0x00, 0x00, 0x00
    };`
  );

  dinoLegs = game.loadGraphics(
    `PROGMEM const unsigned char dino_legs[] = { /*20x5x2*/
      0x00, 0x00, 0x00, 0x00, 0x01, 0x0f, 0x0b, 0x01, 0x01, 0x03,
      0x1f, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x1f, 0x17, 0x03, 0x01, 0x03,
      0x0f, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    };`
  );

  dinoKaput = game.loadGraphics(
    `PROGMEM const unsigned char dino_tumble[] = { /* 30x18 */
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf0, 0xf8, 0xf8, 0xf8,
      0xf8, 0xf0, 0xf0, 0xf0, 0xe0, 0xe0, 0xc0, 0xc0, 0x80, 0xc0,
      0xf0, 0xa8, 0xd8, 0xa8, 0xf8, 0xf8, 0xf8, 0xf8, 0xf8, 0xf0,
      0x00, 0x00, 0x01, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
      0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x01,
      0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x01
    };`
  );

  clouds = game.loadGraphics(
    `PROGMEM const unsigned char clouds[] = { /* 20x16x1 */
      0x1c, 0x22, 0x22, 0x22, 0x24, 0x10, 0x12, 0x2a, 0x21, 0x41,
      0x41, 0x41, 0x42, 0x4a, 0x24, 0x24, 0x18, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    };`
  );

  cactus = game.loadGraphics(
    `PROGMEM const unsigned char cactus[] = { /* 16x24x2 */
      0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0xfe, 0xff, 0xff,
      0xfe, 0x00, 0xc0,  0xc0, 0x80, 0x00,  0x00, 0x00, 0x00,
      0xfe, 0xff, 0xfe,  0x00, 0xff, 0xff,  0xff, 0xff, 0xc0,
      0xff, 0xff, 0x7f,  0x00, 0x00, 0x00,  0x00, 0x01, 0x03,
      0x03, 0x83, 0xff,  0xff, 0xff, 0xff,  0x80, 0x00, 0x00,
      0x00, 0x00, 0x00
      ,
      0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0x00, 0x00, 0x00,
      0x00, 0x00, 0x00,  0x00, 0x00, 0x00,  0x00, 0x00, 0x02,
      0xcf, 0x9e, 0xf0,  0xf8, 0xfc, 0xfc,  0xb8, 0x80, 0xf0,
      0x70, 0x00, 0x00,  0x00, 0x00, 0x00,  0x0c, 0x0d, 0x8b,
      0xbf, 0xff, 0xff,  0xbf, 0x8f, 0x03,  0x00, 0x00, 0x00,
      0x00, 0x00, 0x00
    };`
  );

  sfxBling = game.loadTune(
    `const byte PROGMEM score [] = {
         0x90, 71, 0,116, 0x80,
         0x90, 76, 1,222, 0x80,
         0xf0
    };`
  );

  sfxPlop = game.loadTune(
    `const byte PROGMEM score [] = {
         0x90, 47, 0, 33, 0x80,
         0x90, 41, 0, 50, 0x80,
         0xf0
    };`
  );

  sfxBoing = game.loadTune(
    `const byte PROGMEM score [] = {
         0x90, 57, 0, 33, 0x80,
         0x90, 69, 0, 83, 0x80,
         0xf0
    };`
  );

  sfxEek = game.loadTune(
  `const byte PROGMEM score [] = {
       0x90, 87, 0,50, 0x80,
       0x90, 82, 0,33, 0x80,
       0x90, 87, 0,66, 0x80,
       0xf0
  };`);

  sfxBust = game.loadTune(
    `const byte PROGMEM score [] = {
         0x90, 47, 0, 50, 0x80,
         0x90, 41, 0, 99, 0x80,
         0xf0
    };`
  );

  // Baseline height for ground and dino
  baseline = game.height - 5;
  baselineDino = game.height - dino.height;

  // Starting game state
  game.state = S_INTRO;

  //game.playbackRate = 1/3;
  game.loop(loop);
});


// Loop phase
// Run the game states
function loop() {
  // Slows the game down when "down" button is pressed ("bullet time" :) )
  game.playbackRate = game.buttonPressed("down") ? 1/4 : 1;

  // Play intro animation
  if (game.state == S_INTRO) {
    // Skip intro animation
    if (game.buttonPressed("enter")) return gameSetup();

    // Run intro animation
    let ended = game.run( gameIntro );
    if (!ended) return;

    // Intro animation ended, start the game
    return gameSetup();
  }

  // Clear display
  game.clear();

  // Flash active controls
  if (game.everyXFrame(5)) {
    if (game.buttonPressed("left")) {
      game.drawText("<", 80,50);
    }
    if (game.buttonPressed("right")) {
      game.drawText(">", 93,50);
    }
    if (game.buttonPressed("up")) {
      game.drawText("/\\", 84,45);
    }
    if (game.buttonPressed("down")) {
      game.drawText("\\/", 84,55);
    }
      if (game.buttonPressed("space")) {
      game.drawText("A", 102,50);
    }
    if (game.buttonPressed("enter")) {
      game.drawText("B", 110,50);
    }
  }

  if (game.state == S_PLAYING) {
    let ended = game.run( gamePlay );
    if (!ended) return;

    game.state = S_GAMEOVER;
    return;
  }

  if (game.state == S_GAMEOVER) {
    let ended = game.run( gameOver );

    // Restart game if "enter" (B) was pressed
    if (game.buttonPressed("enter")) ended=true;

    if (!ended) return;

    return gameSetup();
  }

}


function *gameIntro() {

  //for(int i = -8; i < 39; i = i + 2)
  for (let y = -8;  y <= 38; y += 2) {
    game.clear();
    game.drawImage(rjsLogo, 44, 0 );

    game.drawImage(rjs, 25, y );
    yield 1; // essentially delay(16);
  }

  game.drawText("presents", 42, 55);

  //arduboy.tunes.tone(987, 120);
  //delay(120);
  //arduboy.tunes.tone(1318, 400);
  sfxBling.play();


  // Flash the RGB led on the Arduboy or the screen in the browser to a purple color!
  game.custom({
    canvas: `document.body.style.backgroundColor='rgb(96, 0, 128)'`,
    arduboy: `setRGBled(96, 0, 128)`,
  });

  yield 6; // essentially delay(6*16);

  game.custom({
    canvas: `document.body.style.backgroundColor=''`,
    arduboy: `setRGBled(0, 0, 0)`,
  });

  yield 60;


  let y = 12;
    //arduboy.drawBitmap(54-2, y-1,   dino,  20,18, BLACK);
    //arduboy.drawBitmap(54+1, y+1,   dino,  20,18, BLACK);
    game.clearImage(dino, 54-2, y-1);
    game.clearImage(dino, 54+1, y+1);

  //for (int i=0; i<12; ++i) {
  for (let frame = 0; frame <36; ++frame ) {
    let rx = Math.floor(Math.random()*(2+1)) -1; // = random(0,2)-1;
    let ry = Math.floor(Math.random()*(2+1)) -1;
    let noise = 0;// (frame%6>2 ? frame : -frame )/6;

    if (frame%3 === 0) {
      game.drawImage(dino, rx+ 54, ry+ y);
    } else {
      game.clearImage(dino, rx+ 54+noise, ry+ y+noise);
    }
    //arduboy.drawBitmap(rx+ 54+(i%2?i:-i)/2, ry+ y+(i%2?i:-i)/2,   dino_top,  20,18, BLACK);

    yield 1;
  }

  //for(; y < 41; y += 1+y/10)
  while ( y < baselineDino ) {
    //y += (frame + (frame>6?frame-6:0) + (frame>12?frame-12:0))|0;
    y += 1 + y/10;
    if (y > baselineDino) y = baselineDino;

    game.clear();
    game.drawImage(rjsLogo, 44, 0 );
    game.drawImage(rjs, 25, 38 );

    game.drawText("pr   nts", 42, 55);
    game.drawText("ese", 54, 55 + (y>32 ? y-32 : 0));

    game.clearImage(dino, 54-2, y-1);
    game.clearImage(dino, 54+1, y+1);

    game.drawImage(dino, 54, y);

    yield 1;
  }

  //      arduboy.tunes.tone(246, 20);
  //      delay(20);
  //      arduboy.tunes.tone(174, 40);
  //new ArduboyScore("0x90, 47, 0, 33, 0x80, 0x90, 41, 0, 50, 0x80, 0xf0").play();
  sfxPlop.play();

  yield 120;


  //for (int i = 0; i < 64; ++i) {
  for (let i = 0; i < 64; ++i) {
    let z = i<54 ? i : 54;

    game.clearImage(dino, 54-z+1, y);

    //arduboy.drawLine(0, i<32 ? i*2 : 127-i*2, 127,i<32 ? i*2 : 127-i*2, BLACK);
    game.clearRect(0, i<32 ? i*2 : 127-i*2, 128, 1);

    game.drawImage(dino, 54-z, y);

    yield 1;
  }

  yield 10;
}


// Variable to hold the distance ran (basically: score)
let distance;

// Obstacle (cactus) current X position
let obsCactus1, obsCactus2;
let obsCactus1Y, obsCactus2Y;
let obsCactus1YType, obsCactus2YType;

// Global to track dino jump state
let dinoJumpFrame;

// Dino Y coordinate
let dinoJumpHeight = 0;

// Current running speed (screen pixels travelled per second)
let dinoRunSpeed;


// used by calculateNextStep for more precise speed
let calculateNextStepRemainder = 0;
function calculateNextStep(runSpeed) {
  let next = runSpeed/60|0;

  // Accummulate remainders for more accurate speed reproduction
  calculateNextStepRemainder += 100*runSpeed/60%100|0;

  // Extra frames needed
  while (calculateNextStepRemainder>50) {
    next++;
    calculateNextStepRemainder -= 100;
  }

  return next;
}

function calculateRunSpeed(distance, nextStep) {
  return START_SPEED
    + ( (distance+nextStep) /100|0)   // increase by 1 every 100m
    + ( (distance+nextStep) /500|0)*4 // increase by 5 every 500m
}

function *gamePlay() {
  // Next frame in which another meter will be travelled
  let nextStep;

  // Reset game setup to startup values
  gameSetup();

  // Run the game
  while (true) {
    // Calculate next step
    nextStep = calculateNextStep(dinoRunSpeed);

    // Increase distance (score) whilst running
    if ( nextStep ) {
      // Increase speed at every 100 px-s
      dinoRunSpeed = calculateRunSpeed(distance, nextStep);

      // Increase distance
      distance += nextStep;
    }

    // Update state
    updateTerrain(distance);
    updateDino();

    // Draw
    drawTerrain(distance);
    drawDino();
    drawUI();

    // Collision detection
    if (checkCollisions()) break;

    // Next frame
    yield 1;
  }
}

function *gameOver() {
  sfxEek.play();

  // KaputCam TM
  for(let i=0; i<24; i++) {

    drawTerrain();

    if (i!=7 && i!=8 && i!= 16 && i!=17) {
      game.drawImage(dinoEek, 0,baselineDino-dinoJumpHeight);
    }

    drawUI();
    checkCollisions(); // only here for the UI drawing part

    yield 1;
  }

  // Bust
  let falling = true;
  let nextStep;
  let fallDistance = distance;

  while (true) {

    // Fall
    if (dinoJumpHeight > -4) {
      dinoJumpHeight -= 1;
    }
    if (falling && dinoJumpHeight <= -4) {
      dinoJumpHeight = -4;
      sfxBust.play();
      falling = false;
    }

    // Gently slide off into the ground
    if (dinoRunSpeed>0) {
      nextStep = calculateNextStep(dinoRunSpeed);
      dinoRunSpeed -= 1;
      fallDistance += nextStep;
    }

    updateTerrain(fallDistance);
    drawTerrain(fallDistance);

    baselineDino - dinoJumpHeight;

    game.drawImage(dinoKaput, 0,baselineDino-dinoJumpHeight);

    drawUI();

    yield 1;
  }


}

function gameSetup() {
  // Switch game state
  game.state = S_PLAYING;

  // Reset distance (score)
  distance = 0;

  // Reset speed
  dinoRunSpeed = START_SPEED;

  // Cactus position
  obsCactus1 = obsCactus2 = -game.width;
  updateTerrain(distance);

  dinoJumpFrame = 0;
  dinoJumpHeight = 0;
}

function updateTerrain(distance) {
  // Place a new cactus
  if (obsCactus1+cactus.width < distance) {
    obsCactus1 = distance + 175 + 5*Math.floor(0 + Math.random()*(10-0+1));
    obsCactus1Y = game.random(baseline+1,game.height) - cactus.height;
  }

  // Place a second cactus
  if (distance > 500) {
    if (obsCactus2+cactus.width < distance) {
      obsCactus2 = distance + 200 + 6*Math.floor(0 + Math.random()*(10-0+1));
      obsCactus2Y = game.random(baseline+1,game.height) - cactus.height;
    }

    // Make sure placement of cactii is not *too* evil :)
    let obsDistance = obsCactus2-obsCactus1;

    // too dense
    if (obsDistance > 0 && obsDistance < cactus.width/2) {
      obsCactus2 += cactus.width/2|0;
    }
    if (obsDistance < 0 && obsDistance > cactus.width/-2) {
      obsCactus1 += cactus.width/2|0;
    }

    // too close
    obsDistance = obsCactus2-obsCactus1;
    if (obsDistance > cactus.width+5 && obsDistance < cactus.width+dino.width) {
      obsCactus2 += dino.width;
    }
    if (obsDistance < -(cactus.width+5) && obsDistance > -(cactus.width+dino.width)) {
      obsCactus1 += dino.width;
    }

  }
}

function updateDino() {
  // Only in-game
  if (game.state === S_PLAYING) {
    if (!dinoJumpFrame && (game.buttonPressed("space") || game.buttonPressed("up"))) {
      dinoJumpFrame = 1;
      dinoJumpHeight=5;

      sfxBoing.play();

    } else if (dinoJumpFrame) {
      ++dinoJumpFrame;

      if (dinoJumpFrame<6) {
        dinoJumpHeight +=6;
      } else if (dinoJumpFrame<9) {
        dinoJumpHeight +=2;
      } else if (dinoJumpFrame<13) {
        dinoJumpHeight +=1;
      } else if (dinoJumpFrame == 16 || dinoJumpFrame == 18) {
        dinoJumpHeight +=1;
      } else if (dinoJumpFrame == 20 || dinoJumpFrame == 22) {
        dinoJumpHeight -=1;
      } else if (dinoJumpFrame>38) {
        dinoJumpHeight = 0;
        dinoJumpFrame = 0;
      } else if (dinoJumpFrame>32) {
        dinoJumpHeight -=6;
      } else if (dinoJumpFrame>29) {
        dinoJumpHeight -=2;
      } else if (dinoJumpFrame>25) {
        dinoJumpHeight -=1;
      }
    }
  }
}

function drawTerrain(distance) {
  // Parallax scrolling clouds
  game.drawImage(clouds[0], game.width -(distance%(game.width+clouds.width)),5);

  // Terrain
  if (dinoJumpHeight > 4) {
    game.fillRect( 0,baseline, 128,1);
  } else {
    game.fillRect( 0,baseline, 4,1);
    game.fillRect(12,baseline, 116,1); // => drawLine(x,y, x+w-1, y+h-1, WHITE )
  }

  // Obstacles
  let c1 = obsCactus1-distance;
  let c2 = obsCactus2-distance;
  if (c1 < game.width) game.drawImage(cactus[0], c1,obsCactus1Y);
  if (c2 < game.width) game.drawImage(cactus[1], c2,obsCactus2Y);
}

function drawDino() {
  let dy = baselineDino - dinoJumpHeight;

  game.drawImage(dino, 0,0, 20,18, 0,dy ,20,18);

  // Run, Dino, Run!
  if (!dinoJumpHeight) {
    game.drawImage(dinoLegs[ (distance/10|0)%2 ], 0,dy+18);
  } else {
    game.drawImage(dino, 0,18, 20,5, 0,dy+18, 20,5);
  }
}

function drawUI() {
  // hud
  //arduboy.setCursor(0, 0);
  //sprintf(text,"DIST: %d",d);
  game.drawText("DIST: " + (distance/10|0) + " SPD: " + dinoRunSpeed, 0,0);
}

function checkCollisions() {
  let c1 = obsCactus1 - distance;
  let c2 = obsCactus2 - distance;
  let dy = baselineDino - dinoJumpHeight;
  let hit = false;

  hit = hit
    || ( c1<=dino.width && game.detectCollision(dino, 0,dy, cactus[0], c1,obsCactus1Y) )
    || ( c2<=dino.width && game.detectCollision(dino, 0,dy, cactus[1], c2,obsCactus1Y) );

  return hit;
}


console.log("MicroCanvas: Animate Demo with Generators");
