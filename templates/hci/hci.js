"use strict";

let game = new MicroCanvas();

let gfxInvader, gfxDefender;
let gfxInvader2;
let gfxRocket;



let rocketX, rocketY;
let turretX;


let invaders = [ 0xff, 0xff, 0xff, 0xff ];


// Initialize game
game.setup(function(game) {
  // Set up graphics
  gfxInvader = game.loadSprite(
    `PROGMEM const unsigned char invader[] = { /*9x8*/ 0x70, 0x38, 0x6a, 0x3c, 0x78, 0x3c, 0x6a, 0x38, 0x70 }`
  );

  gfxInvader2 = game.loadSprite(
    `PROGMEM const unsigned char invader2[] = { /*9x8*/ 0x28, 0x10, 0xba, 0x6a, 0x3f, 0x6a, 0xba, 0x10, 0x28 }`
  );

  gfxDefender = game.loadSprite(
    `PROGMEM const unsigned char defender[] = {
      /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38
    }`
  );

  gfxRocket = game.loadSprite(
    `PROGMEM const unsigned char rocket[] = {
      /*1x3*/ 0x07
    }`
  );

  // Place defender in the middle of the playing field
  turretX = game.width/2;

  // Reset rocket
  rocketX = 0;
  rocketY = 0;
});



// Main game loop
game.loop(function() {

  // Clear display, redraw background text
  game.clear();


  // Handle keypresses
  if ( game.buttonPressed('left') ) {
    turretX = turretX-3;
  }

  if ( game.buttonPressed('right') ) {
    turretX = turretX+3;
  }


  // Enforce screen boundaries
  if ( turretX < 0 ) {
    turretX = 0;
  }

  if ( turretX > game.width-gfxDefender.width/2) {
    turretX = game.width-gfxDefender.width/2;
  }

  // Update turret projectile
  // No rocket on-screen
  if (rocketY < 3) {
	/// Fire new rocket
    if (game.buttonPressed('space')) {
      rocketY = game.height - 3;
      rocketX = turretX - 1;
    }
  }
  // If rocket is still visible, move it towards the top of the screen
  if (rocketY >= 3) {
    rocketY = rocketY -3;
  }


  // Draw the game
  draw();

});



let invaderAnimation = 1;
let invaderX = 0;

function draw() {
  game.clear()


  // Animate invaders
  if ( game.everyXFrames(10) ) {
    invaderX = invaderX + invaderAnimation;

    if (invaderX >= 6) {
      invaderAnimation = -1;
    }
    if (invaderX <= 0) {
      invaderAnimation = 1;
    }
  }


  // Draw invaders
  let startX = (game.width - (8*(gfxInvader.width+4)-4))/2;

  let y = 0;
  while (y < 4) {

    let x = 0;
    while (x < 8) {


      // Don't draw destroyed invaders
      if (invaders[y] & (1<<x)) {
        // Move different rows of invaders differently
        if (y % 2) {
          game.drawImage(gfxInvader, startX + (invaderX-3) + x*(gfxInvader.width+4), y*(gfxInvader.height+1));

          if (rocketY >=3 && game.detectCollision(gfxInvader, startX + (invaderX-3) + x*(gfxInvader.width+4), y*(gfxInvader.height+1), gfxRocket, rocketX, rocketY)) {
            invaders[y] = invaders[y] & ~(1<<x);
            rocketY = 0;
          }

        } else {
          game.drawImage(gfxInvader2, startX - (invaderX-3) + x*(gfxInvader.width+4), y*(gfxInvader.height+1));

          if (rocketY >=3 && game.detectCollision(gfxInvader2, startX - (invaderX-3) + x*(gfxInvader.width+4), y*(gfxInvader.height+1), gfxRocket, rocketX, rocketY)) {
            invaders[y] = invaders[y] & ~(1<<x);
            rocketY = 0;
          }
        }
      }

      x = x + 1;
    }

    y = y + 1;
  }


  // Draw defender
  game.drawImage(gfxDefender , turretX-5, game.height-8);


  // Draw rocket
  if (rocketY >= 3) {
    game.fillRect(rocketX, rocketY, 1,2);
  }
}


console.log("MicroCanvas initialized: HCFDemo");
