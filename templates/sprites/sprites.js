"use strict";

let game = new MicroCanvas();
let bats;

game.setup(function(mctx) {
  bats = mctx.loadSprite(
    `PROGMEM const unsigned char bats[] = { /*16x6x2*/
      0x01, 0x0f, 0x0e, 0x1c, 0x38, 0x3c, 0x1b, 0x3e,
      0x3e, 0x1b, 0x3c, 0x38, 0x1c, 0x0e, 0x0f, 0x01,
      0x1c, 0x0e, 0x0c, 0x07, 0x0e, 0x0c, 0x1b, 0x3e,
      0x3e, 0x1b, 0x0c, 0x0e, 0x07, 0x0c, 0x0e, 0x1c,
    };`
  );

  mctx.loop(loop);
});





let x = 0, y = 24;
let sx = 1, sy = 1;

let animationSpeed = 8;
let cSprite = 0;

function loop() {
  // pause render until it's time for the next frame
  // automatically // if (!(arduboy.nextFrame())) return;

  // Update flapping animation
  if (game.everyXFrame(animationSpeed)) {
    cSprite = !cSprite;
  }

  // Update position
  x += sx;
  y += sy;

  if (x>108 || x<1) sx = -sx;
  if (y>56 || y<1) sy = -sy;


  // Clear display, redraw background text
  game.clear();
  //arduboy.setCursor(0,0);
  //arduboy.print("Sprite\nDemo");
  game.drawText("Sprite\nDemo", 0,0, 3);

  // Draw shadow (unset pixels on screen based on the bitmap)
  // TODO:
  game.eraseImage(bats[cSprite|0], 0 +x,2 +y);
  game.eraseImage(bats[cSprite|0], 2 +x,2 +y);

  // Draw Bat
  game.drawImage(bats[cSprite|0], 1 +x,1 +y);

  // Draw Bat Sprite
  //game.drawImage(sprite[cSprite+0], 107 -x,55 -y);

//  game.drawImage(game.gfont[65], 60,30 ,10,14);
//  game.drawImage(game.gfont[66], 72,30 ,10,14);

  // Update Screen
  // automatically? // arduboy.display();
}

console.log("MicroCanvas initialized");
