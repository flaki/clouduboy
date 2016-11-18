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
game.loop(function() {
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
  }

});


function *gamePlay() {
  let h = game.height - gfxDino.height;
  let dinY = h;
  let dirY = -1;

  // Run the game
  while (true) {
    game.clear();


    /* TODO: */ game.custom({ arduboy: `
arduboy.setCursor( 40, 10 );
arduboy.print( itoa(din_y, _microcanvas_textbuffer, 10) )`});

    game.drawImage(gfxDino, 0, dinY);

    // Next frame
    yield 1;
    dinY += dirY;
    if (dinY==0 || dinY==h) dirY *=-1;
  }

  return 1;
}

function *gameOver() {
}

console.log("MicroCanvas: Animate Demo with Generators");
