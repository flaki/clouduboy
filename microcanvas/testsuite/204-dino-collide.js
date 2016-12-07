"use strict";

let game = new MicroCanvas();

// Graphics assets
let gfxDino;


// Game state globals
const S_PLAYING = 2;
const S_GAMEOVER = 3;


// Setup phase
// Load assets, preconfigure globals, set up microcanvas subsystem
game.setup(function(game) {

  gfxDino = game.loadGraphics(
    `PROGMEM const unsigned char gfxDino[] = { /*20x24*/
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xfe, 0xff, 0xfb, 0xff, 0xff, 0xbf, 0xbf, 0xbf, 0x3f, 0x3e,
      0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff,
      0xff, 0xff, 0xff, 0x7f, 0x04, 0x0c, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x01, 0x03, 0x07, 0x7f, 0x5f, 0x0f, 0x07, 0x0f,
      0x7f, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    };`
  );

  game.state = S_PLAYING;
});


// Loop phase
// Run the game states
let x1 = 0,
    x2 = 48,
    y1 = 0,
    y2 = 32;

game.loop(function() {
  game.clear();

  if (game.everyXFrames(30)) {
    x1 = game.random(0,48);
    x2 = game.random(0,48);
    y1 = game.random(0,32);
    y2 = game.random(0,32);
  }

  game.drawImage(gfxDino, x1,y1);
  game.drawImage(gfxDino, x2,y2);

  if ( game.detectCollision(gfxDino, x1,y1, gfxDino, x2,y2) ) {
    game.custom({
      canvas: `document.body.style.backgroundColor='rgb(128, 0, 0)'`,
      arduboy: `arduboy.setRGBled(0, 0, 128)`,
    });
  } else {
    game.custom({
      canvas: `document.body.style.backgroundColor=''`,
      arduboy: `arduboy.setRGBled(0, 0, 0)`,
    });
  }

});


console.log("MicroCanvas: Collision check");
