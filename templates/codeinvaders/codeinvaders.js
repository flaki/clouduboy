"use strict";

let game = new MicroCanvas();

let gfxInvader, gfxDefender;

game.setup(function(game) {
  gfxInvader = game.loadSprite(
    `PROGMEM const unsigned char invader[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 }`
  );
  //let invader = new Image();
  //invader.src="https://happycodefriends.github.io/code-invaders/invader.png";
  //invader.onload=function(){ invader.loaded = true };

  gfxDefender = game.loadSprite(
    `PROGMEM const unsigned char defender[] = {
      /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38
    }`
  );
  //let turret = new Image();
  //turret.src="https://happycodefriends.github.io/code-invaders/turret.png";
  //turret.onload=function(){ turret.loaded = true };

});



let rocketX;
let rocketY = 0;

let gameareaSize = 64;
let turretPosition = gameareaSize/2;


game.loop(function() {

  // Clear display, redraw background text
  game.clear();


  // Handle keypresses
  if (game.buttonPressed('left')) turretPosition = turretPosition-3;
  if (turretPosition<0) turretPosition = 0;

  if (game.buttonPressed('right')) turretPosition = turretPosition+3;
  if (turretPosition>gameareaSize-gfxDefender.width) turretPosition = gameareaSize-gfxDefender.width;

  // Update turret projectile
  if (rocketY <= 0) {
    if (game.buttonPressed('space')) {
      rocketY = gameareaSize - 3;
      rocketX = turretPosition - 1;
    }
  }

  if (rocketY > 0) {
    rocketY = rocketY -3;
  }


  // Draw the game
  draw();

});


function draw() {
  game.clear()

  let y = 0;
  while (y < 4) {

   let x = 0;
   while (x < 5) {
     if (y % 2)
       game.drawImage(gfxInvader, 13*x+Math.abs(game.frameCount%30/5-3), 9*y);
     else
       game.drawImage(gfxInvader, 13*x+4-Math.abs(game.frameCount%30/5-3), 9*y);

     x = x + 1;
   }
   y = y + 1;
  }

  game.drawImage(gfxDefender , turretPosition-5, gameareaSize-8);

  if (game.buttonPressed('left')) game.drawText('<', 0, gameareaSize-7);
  if (game.buttonPressed('right')) game.drawText('>', gameareaSize-10, gameareaSize-7);

  if (rocketY > 0) {
    game.fillRect(rocketX, rocketY, 1,2);
  }
}


console.log("MicroCanvas initialized");
