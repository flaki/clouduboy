"use strict";

let game = new MicroCanvas();

let gfxSpriteA, gfxSpriteB;


game.setup(function(game) {
  gfxSpriteA = game.loadSprite(
    `PROGMEM const unsigned char sprite_a[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 }`
  );
  gfxSpriteB = game.loadSprite(
    `PROGMEM const unsigned char sprite_b[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x3c, 0x1e, 0x3c, 0x35, 0x1c, 0x38 }`
  );
});


game.loop(function() {

  // Clear display, redraw background text
  game.clear();

  // Animation shows different sprite images, switching between them every second
  game.drawImage(Math.floor(game.frameCount/60)%2 ? gfxSpriteA : gfxSpriteB, 58,28);

});


console.log("MicroCanvas initialized");
