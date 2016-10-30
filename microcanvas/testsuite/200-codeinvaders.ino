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


PROGMEM const unsigned char gfx_invader[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 };

PROGMEM const unsigned char gfx_invader_2[] = { /*9x6*/ 0x18, 0x3c, 0x15, 0x3e, 0x1c, 0x3e, 0x15, 0x3c, 0x18 };

PROGMEM const unsigned char gfx_defender[] = { /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38 };


const byte GFX_INVADER_WIDTH = 9;
const byte GFX_INVADER_HEIGHT = 6;
const byte GFX_INVADER_FRAMES = 0;
const byte GFX_INVADER_FRAMESIZE = 9;
const byte GFX_INVADER_2_WIDTH = 9;
const byte GFX_INVADER_2_HEIGHT = 6;
const byte GFX_INVADER_2_FRAMES = 0;
const byte GFX_INVADER_2_FRAMESIZE = 9;
const byte GFX_DEFENDER_WIDTH = 9;
const byte GFX_DEFENDER_HEIGHT = 6;
const byte GFX_DEFENDER_FRAMES = 0;
const byte GFX_DEFENDER_FRAMESIZE = 9;

int rocket_x;
int rocket_y = 0;
int gamearea_size = 64;
int turret_position;

void draw() {
////// FUNCTION BODY //////
arduboy.clear();
int y = 0;
while (y < 4) {
  int x = 0;
  while (x < 5) {
  int d = (_microcanvas_frame_counter % 60 < 30 ? _microcanvas_frame_counter % 60 / 10 | 0 : 3 - _microcanvas_frame_counter % 60 / 10 | 0);
  arduboy.drawBitmap( 13 * x + (y % 2 ? d : 3 - d) + 3, 9 * y, (_microcanvas_frame_counter / 10 | 0 % 2 ? gfx_invader : gfx_invader_2), (_microcanvas_frame_counter / 10 | 0 % 2 ? GFX_INVADER_WIDTH : GFX_INVADER_2_WIDTH), (_microcanvas_frame_counter / 10 | 0 % 2 ? GFX_INVADER_HEIGHT : GFX_INVADER_2_HEIGHT), WHITE );
  x = x + 1;
}
  y = y + 1;
}
{
arduboy.setCursor( 100, 0 );
arduboy.print( _microcanvas_frame_counter % 30 / 5 | 0 - 3 );
};
arduboy.drawBitmap( turret_position - 5, gamearea_size - 8, gfx_defender, GFX_DEFENDER_WIDTH, GFX_DEFENDER_HEIGHT, WHITE );
if (arduboy.pressed( LEFT_BUTTON )) {
arduboy.setCursor( 0, gamearea_size - 7 );
arduboy.print( "<" );
};
if (arduboy.pressed( RIGHT_BUTTON )) {
arduboy.setCursor( gamearea_size - 10, gamearea_size - 7 );
arduboy.print( ">" );
};
if (rocket_y > 0) {
  arduboy.fillRect( rocket_x, rocket_y, 1, 2, WHITE );
}

}


void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////

}


void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
if (arduboy.pressed( LEFT_BUTTON )) turret_position = turret_position - 3;
if (turret_position < 0) turret_position = 0;
if (arduboy.pressed( RIGHT_BUTTON )) turret_position = turret_position + 3;
if (turret_position > gamearea_size - GFX_DEFENDER_WIDTH / 2) turret_position = gamearea_size - GFX_DEFENDER_WIDTH / 2;
if (rocket_y <= 0) {
  if (arduboy.pressed( A_BUTTON )) {
  rocket_y = gamearea_size - 3;
  rocket_x = turret_position - 1;
}
}
if (rocket_y > 0) {
  rocket_y = rocket_y - 3;
}
draw();
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
