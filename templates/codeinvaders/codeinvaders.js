"use strict";

let left,right,fire;

let rocket_x;
let rocket_y = 0;

let gamearea_size = 80;
let turret_position = gamearea_size/2;

let canvas_element = window.myCanvas;

let canvas = canvas_element.getContext("2d");
canvas_element.width = canvas.width = gamearea_size;
canvas_element.height = canvas.height = gamearea_size;

let invader = new Image();
invader.src="https://happycodefriends.github.io/code-invaders/invader.png";
invader.onload=function(){ invader.loaded = true };

let turret = new Image();
turret.src="https://happycodefriends.github.io/code-invaders/turret.png";
turret.onload=function(){ turret.loaded = true };

canvas_element.addEventListener("touchmove", function(e) {
 turret_position = (e.touches[0].pageX-canvas_element.offsetLeft)/300*gamearea_size;
});

window.addEventListener("keydown", function(e) {
 if (e.keyCode===37) left = true;
 if (e.keyCode===39) right = true;
 if (e.keyCode===32) fire = true;
});

window.addEventListener("keyup", function(e) {
 if (e.keyCode===37) left = false;
 if (e.keyCode===39) right = false;
 if (e.keyCode===32) fire = false;
});

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


 if (invader.loaded && turret.loaded) draw();
}

let frame = 0;
function draw() {
 frame = frame + 1;
 canvas.clearRect(0,0,gamearea_size,gamearea_size);

 let y = 0;
 while (y < 4) {

   let x = 0;
   while (x < 6) {
     if (y % 2)
       canvas.drawImage(invader, 13*x+Math.abs(frame%30/5-3), 9*y);
     else
       canvas.drawImage(invader, 13*x+4-Math.abs(frame%30/5-3), 9*y);

     x = x + 1;
   }
   y = y + 1;
 }

 canvas.drawImage(turret , turret_position-5, gamearea_size-8);

 canvas.fillStyle="white";
 canvas.font="12px arial";
 if (left) canvas.fillText('<', 0, gamearea_size);
 if (right) canvas.fillText('>', gamearea_size-10, gamearea_size);

 if (rocket_y > 0) {
   canvas.fillRect(rocket_x, rocket_y, 1,2);
 }
}

setInterval(play, 40);
