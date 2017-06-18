var rocky = require('rocky');

rocky.on('secondchange', function(event) {
  rocky.requestDraw();
});


rocky.on('draw', function(event) {
  // Get the CanvasRenderingContext2D object
  var ctx = event.context;
  draw(ctx);
});




var bmpTurret = '\n\
    .........\n\
    ....#....\n\
    ...###...\n\
    ..#####..\n\
    #.##.##.#\n\
    ###...###\n\
    #########\n\
  ';

var bmpInvader = '\n\
    ..#...#..\n\
    ...#.#...\n\
    .#######.\n\
    ##.###.##\n\
    #########\n\
    #.#.#.#.#\n\
  ';
/*
  let bmpInvader1b = `
    ...#.#...
    .. #.#...
    .#######.
    ##.###.##
    #########
    .#.#.#.#.
  `;
*/

function loadBitmap(bmp) {
  var bitmap = bmp.trim().replace(/[ \t]/g,'').split(/\n/);

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  canvas.width = ctx.width = bitmap[0].length;
  canvas.height = ctx.height = bitmap.length;

  ctx.fillStyle = "white";

  bitmap.forEach(function(row, y) {
    row.split("").forEach(function(px, x) {
      if (px === "#") ctx.fillRect(x, y, 1, 1);
    });
  });

  return canvas;
}

function drawBitmap(bmp, ctx, ox, oy) {
    var bitmap = bmp.trim().replace(/[ \t]/g,'').split(/\n/);
    bitmap.forEach(function(row, y) {
      row.split("").forEach(function(px, x) {
        if (px === "#") ctx.fillRect(x +ox, y +oy, 1, 1);
      });
    });
}



var left,right,fire;

var rocket_x;
var rocket_y = 0;

var gamearea_size = 80;
var turret_position = gamearea_size/2;




function play() {
 if (left) turret_position = turret_position-3;
 if (right) turret_position = turret_position+3;

 if (rocket_y <= 0) {
   if (fire) {
     rocket_y = gamearea_size - 3;
     rocket_x = turret_position - 1;
   }
 }

 if (rocket_y > 0) {
   rocket_y = rocket_y -3;
 }
}

var frame = 0;
function draw(ctx) {
  frame = frame + 1;

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  var y = 0;
  while (y < 4) {

    var x = 0;
      while (x < 6) {
      if (y % 2)
        //ctx.drawImage(invader, 13*x+Math.abs(frame%30/5-3), 9*y);
        drawBitmap(ctx, bmpInvader, 13*x+Math.abs(frame%30/5-3), 9*y);
      else
        //ctx.drawImage(invader, 13*x+4-Math.abs(frame%30/5-3), 9*y);
        drawBitmap(ctx, bmpInvader, 13*x+4-Math.abs(frame%30/5-3), 9*y);


      x = x + 1;
    }
    y = y + 1;
  }

  //ctx.drawImage(turret , turret_position-5, gamearea_size-8);
  drawBitmap(ctx, turret, turret_position-5, gamearea_size-8);



  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Current date/time
  var d = new Date();

  // Set the text color
  ctx.fillStyle = 'white';

  // Center align the text
  ctx.textAlign = 'center';

  // Display the time, in the middle of the screen
  ctx.fillText(d.toLocaleTimeString(), w / 2, h / 2, w);

}
