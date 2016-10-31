"use strict";

let game = new MicroCanvas();

let sfxScore;


game.setup(function(game) {
  sfxScore = game.loadTune(
    `const byte PROGMEM score [] = {
      3,0,
         0x90, 48, 1,0, 0x80, 0,32,
         0x90, 48, 0,128, 0x80, 0,32,
         0x90, 50, 1,128, 0x80, 0,32,
         0x90, 48, 1,128, 0x80, 0,32,
         0x90, 53, 1,128, 0x80, 0,32,
         0x90, 52, 3,0, 0x80, 0,32,
      1,128,
         0x90, 48, 1,0, 0x80, 0,32,
         0x90, 48, 0,128, 0x80, 0,32,
         0x90, 50, 1,128, 0x80, 0,32,
         0x90, 48, 1,128, 0x80, 0,32,
         0x90, 55, 1,128, 0x80, 0,32,
         0x90, 53, 3,0, 0x80, 0,32,
      1,128,
      0xf0
    };`
  );
});


game.loop(function() {
  if (!game.soundPlaying()) sfxScore.play();
});

console.log("MicroCanvas initialized");
