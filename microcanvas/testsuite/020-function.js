"use strict";

let game = new MicroCanvas();


game.setup(function(game) {
});

function myFunction(myParam) {
  return myParam+1;
}

game.loop(function() {

  // Clear display, redraw background text
  game.clear();

  let localVar = myFunction(7);
});


console.log("MicroCanvas initialized");
