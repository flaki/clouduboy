#include <SPI.h>
#include "Arduboy.h"

#include <EEPROM.h>
#include <avr/pgmspace.h>

Arduboy arduboy;

// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

// sprintf() textbuffer for drawText
char _microcanvas_textbuffer[32];

// global state machine
unsigned int _microcanvas_state;


PROGMEM const unsigned char gfx_invader[] = { /*9x8*/ 0x70, 0x38, 0x6a, 0x3c, 0x78, 0x3c, 0x6a, 0x38, 0x70 };

PROGMEM const unsigned char gfx_defender[] = { /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38 };

PROGMEM const unsigned char gfx_invader_2[] = { /*9x8*/ 0x28, 0x10, 0xba, 0x6a, 0x3f, 0x6a, 0xba, 0x10, 0x28 };

PROGMEM const unsigned char gfx_rocket[] = { /*1x3*/ 0x07 };


const byte GFX_INVADER_WIDTH = 9;
const byte GFX_INVADER_HEIGHT = 8;
const byte GFX_INVADER_FRAMES = 0;
const byte GFX_INVADER_FRAMESIZE = 9;
const byte GFX_INVADER_2_WIDTH = 9;
const byte GFX_INVADER_2_HEIGHT = 8;
const byte GFX_INVADER_2_FRAMES = 0;
const byte GFX_INVADER_2_FRAMESIZE = 9;
const byte GFX_DEFENDER_WIDTH = 9;
const byte GFX_DEFENDER_HEIGHT = 6;
const byte GFX_DEFENDER_FRAMES = 0;
const byte GFX_DEFENDER_FRAMESIZE = 9;
const byte GFX_ROCKET_WIDTH = 1;
const byte GFX_ROCKET_HEIGHT = 3;
const byte GFX_ROCKET_FRAMES = 0;
const byte GFX_ROCKET_FRAMESIZE = 1;

int rocket_x;
int rocket_y;
int turret_x;
byte invaders[] = { 0xff, 0xff, 0xff, 0xff };
int invader_animation = 1;
int invader_x = 0;

boolean collides(const unsigned char* s1, int x1,int y1, int s1_width, int s1_height, const unsigned char* s2, int x2,int y2, int s2_width, int s2_height, boolean precise) {
  boolean result = false;

  // Basic collision rectangle
  int cx = x1>x2 ? x1 : x2;
  int cw = x1>x2 ? x2+s2_width-x1 : x1+s1_width-x2;

  int cy = y1>y2 ? y1 : y2;
  int ch = y1>y2 ? y2+s2_height-y1 : y1+s1_height-y2;

  if (cw>0 && ch>0) {
    result = true;
  }

  // No bounding rect collision or no precise check requested
  if (!precise || !result) {
    return result;
  }


  return false;
}

void draw() {
////// FUNCTION BODY //////
arduboy.clear();
if (arduboy.everyXFrames( 10 )) {
  invader_x = (invader_x + invader_animation);
  if (invader_x >= 6) {
  invader_animation = -1;
}
  if (invader_x <= 0) {
  invader_animation = 1;
}
}
int start_x = (WIDTH - (8 * (GFX_INVADER_WIDTH + 4) - 4)) / 2;
int y = 0;
while (y < 4) {
  int x = 0;
  while (x < 8) {
  if (invaders[y] & (1 << x)) {
  if (y % 2) {
  arduboy.drawBitmap( ((start_x + (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4)), y * (GFX_INVADER_HEIGHT + 1), gfx_invader, GFX_INVADER_WIDTH, GFX_INVADER_HEIGHT, WHITE );
  if (rocket_y >= 3 && collides( gfx_invader, ((start_x + (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4)), y * (GFX_INVADER_HEIGHT + 1), GFX_INVADER_WIDTH, GFX_INVADER_HEIGHT, gfx_rocket, rocket_x, rocket_y, GFX_ROCKET_WIDTH, GFX_ROCKET_HEIGHT, false )) {
  invaders[y] = invaders[y] & ~(1 << x);
  rocket_y = 0;
}
} else {
  arduboy.drawBitmap( ((start_x - (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4)), y * (GFX_INVADER_HEIGHT + 1), gfx_invader_2, GFX_INVADER_2_WIDTH, GFX_INVADER_2_HEIGHT, WHITE );
  if (rocket_y >= 3 && collides( gfx_invader_2, ((start_x - (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4)), y * (GFX_INVADER_HEIGHT + 1), GFX_INVADER_2_WIDTH, GFX_INVADER_2_HEIGHT, gfx_rocket, rocket_x, rocket_y, GFX_ROCKET_WIDTH, GFX_ROCKET_HEIGHT, false )) {
  invaders[y] = invaders[y] & ~(1 << x);
  rocket_y = 0;
}
}
}
  x = (x + 1);
}
  y = (y + 1);
}
arduboy.drawBitmap( (turret_x - 5), (HEIGHT - 8), gfx_defender, GFX_DEFENDER_WIDTH, GFX_DEFENDER_HEIGHT, WHITE );
if (rocket_y >= 3) {
  arduboy.fillRect( rocket_x, rocket_y, 1, 2, WHITE );
}

}


void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////
turret_x = WIDTH / 2;
rocket_x = 0;
rocket_y = 0;
}


void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
if (arduboy.pressed( LEFT_BUTTON )) {
  turret_x = (turret_x - 3);
}
if (arduboy.pressed( RIGHT_BUTTON )) {
  turret_x = (turret_x + 3);
}
if (turret_x < 0) {
  turret_x = 0;
}
if (turret_x > (WIDTH - GFX_DEFENDER_WIDTH / 2)) {
  turret_x = (WIDTH - GFX_DEFENDER_WIDTH / 2);
}
if (rocket_y < 3) {
  if (arduboy.pressed( A_BUTTON )) {
  rocket_y = (HEIGHT - 3);
  rocket_x = (turret_x - 1);
}
}
if (rocket_y >= 3) {
  rocket_y = (rocket_y - 3);
}
draw();
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
