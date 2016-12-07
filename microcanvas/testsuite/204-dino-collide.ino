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


PROGMEM const unsigned char gfx_dino[] = { /*20x24*/ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xfb, 0xff, 0xff, 0xbf, 0xbf, 0xbf, 0x3f, 0x3e, 0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x7f, 0x04, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x03, 0x07, 0x7f, 0x5f, 0x0f, 0x07, 0x0f, 0x7f, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };


const byte S_PLAYING = 2;
const byte S_GAMEOVER = 3;
const byte GFX_DINO_WIDTH = 20;
const byte GFX_DINO_HEIGHT = 24;
const byte GFX_DINO_FRAMES = 0;
const byte GFX_DINO_FRAMESIZE = 60;

int x_1 = 0;
int x_2 = 48;
int y_1 = 0;
int y_2 = 32;

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



void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////
_microcanvas_state = S_PLAYING;
}


void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
if (arduboy.everyXFrames( 30 )) {
  x_1 = random( 0, 48 );
  x_2 = random( 0, 48 );
  y_1 = random( 0, 32 );
  y_2 = random( 0, 32 );
}
arduboy.drawBitmap( x_1, y_1, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
arduboy.drawBitmap( x_2, y_2, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
if (collides( gfx_dino, x_1, y_1, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, gfx_dino, x_2, y_2, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, false )) {
  arduboy.setRGBled(0, 0, 128);
} else {
  arduboy.setRGBled(0, 0, 0);
}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

