#include "Arduboy.h"


// Sprite assets
PROGMEM const unsigned char sprite1[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 };

PROGMEM const unsigned char sprite2[] = { /*9x6*/ 0x18, 0x3c, 0x15, 0x3e, 0x1c, 0x3e, 0x15, 0x3c, 0x18 };

PROGMEM const unsigned char defender[] = { /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38 };


Arduboy arduboy;


boolean left,right,fire;

int rocket_x;
int rocket_y = 0;

int gamearea_size = 128;
int gamearea_h = 64;
int turret_position = gamearea_size/2;

void setup() {
  arduboy.begin();
  arduboy.setFrameRate(25);
  arduboy.display();
}

int x = 0, y = 24;
int sx = 1, sy = 1;

int frame = 0;


void loop () {
  // pause render until it's time for the next frame
  if (!(arduboy.nextFrame()))
    return;

  // Track frames
  frame = (frame+1) % 25;

  // Track button "events"
  if (arduboy.pressed(LEFT_BUTTON)) left = true;
  if (arduboy.pressed(RIGHT_BUTTON)) right = true;
  if (arduboy.pressed(A_BUTTON)) fire = true;

  if (!arduboy.pressed(LEFT_BUTTON)) left = false;
  if (!arduboy.pressed(RIGHT_BUTTON)) right = false;
  if (!arduboy.pressed(A_BUTTON)) fire = false;


  // Game logic: update & render
  update();
  render();
}


void update () {
 if (left) turret_position = turret_position-3;
 if (right) turret_position = turret_position+3;

 if (rocket_y <= 0) {
   if (fire) {
     rocket_y = gamearea_h - 3;
     rocket_x = turret_position - 1;
   }
 }

 if (rocket_y > 0) {
   rocket_y = rocket_y -3;
 }
}


void render () {
  // Clear display, redraw background text
  arduboy.clear();

  int y = 0;
  while (y < 4) {
    int x = 0;
    while (x < 6) {
      if (y % 2) {
        arduboy.drawBitmap((gamearea_size-80)/2+ 13*x+abs(frame%35/5-3), 9*y, sprite1, 9,6, WHITE);
      } else {
        arduboy.drawBitmap((gamearea_size-80)/2+ 13*x+4-abs(frame%35/5-3), 9*y, sprite2, 9,6, WHITE);
      }
      x++;
    }
    y++;
  }

  // Defender
  arduboy.drawBitmap(turret_position-5, gamearea_h-8, defender, 9,6, WHITE);

  // Rocket
   if (rocket_y > 0) {
     arduboy.drawLine(rocket_x, rocket_y, rocket_x,rocket_y+2, WHITE);
   }


  // Update Screen
  arduboy.display();
}
