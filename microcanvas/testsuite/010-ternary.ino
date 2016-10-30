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


PROGMEM const unsigned char gfx_sprite_a[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 };

PROGMEM const unsigned char gfx_sprite_b[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x3c, 0x1e, 0x3c, 0x35, 0x1c, 0x38 };


const byte GFX_SPRITE_A_WIDTH = 9;
const byte GFX_SPRITE_A_HEIGHT = 6;
const byte GFX_SPRITE_A_FRAMES = 0;
const byte GFX_SPRITE_A_FRAMESIZE = 9;
const byte GFX_SPRITE_B_WIDTH = 9;
const byte GFX_SPRITE_B_HEIGHT = 6;
const byte GFX_SPRITE_B_FRAMES = 0;
const byte GFX_SPRITE_B_FRAMESIZE = 9;




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
arduboy.drawBitmap( 58, 28, floor( _microcanvas_frame_counter / 60 ) % 2 ? gfx_sprite_a : gfx_sprite_b, (floor( _microcanvas_frame_counter / 60 ) % 2 ? GFX_SPRITE_A_WIDTH : GFX_SPRITE_B_WIDTH), (floor( _microcanvas_frame_counter / 60 ) % 2 ? GFX_SPRITE_A_HEIGHT : GFX_SPRITE_B_HEIGHT), WHITE );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
