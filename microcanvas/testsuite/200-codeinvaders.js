"use strict";

let game = new MicroCanvas();

let gfxInvader, gfxInvader2, gfxDefender;

game.setup(function(game) {
  gfxInvader = game.loadSprite(
    `PROGMEM const unsigned char invader[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 }`
  );
  gfxInvader2 = game.loadSprite(
    `PROGMEM const unsigned char invader2[] = { /*9x6*/ 0x18, 0x3c, 0x15, 0x3e, 0x1c, 0x3e, 0x15, 0x3c, 0x18 }`
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
  if (turretPosition>gameareaSize-gfxDefender.width/2) turretPosition = gameareaSize-gfxDefender.width/2;

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

// TODO: bugfix this
//     if (y % 2)
//       game.drawImage(gfxInvader, 13*x+Math.abs(game.frameCount%30/5-3), 9*y);
//     else
///      game.drawImage(gfxInvader, 13*x+4-Math.abs(game.frameCount%30/5-3), 9*y);
    let d = game.frameCount%30<15 ? (3 - Math.floor(game.frameCount%30/5)) : (Math.floor(game.frameCount%30/5) - 3);

    game.drawImage(Math.floor(game.frameCount/10)%2 ? gfxInvader : gfxInvader2, 13*x +(y%2 ? d : 4-d), 9*y);

     x = x + 1;
   }
   y = y + 1;
  }

  game.drawText( Math.abs(game.frameCount%30/5-3), 100,0);

  game.drawImage(gfxDefender , turretPosition-5, gameareaSize-8);

  if (game.buttonPressed('left')) game.drawText('<', 0, gameareaSize-7);
  if (game.buttonPressed('right')) game.drawText('>', gameareaSize-10, gameareaSize-7);

  if (rocketY > 0) {
    game.fillRect(rocketX, rocketY, 1,2);
  }
}


console.log("MicroCanvas initialized");
