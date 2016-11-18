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


void _microcanvas_yield(byte n) {
  arduboy.display();
  while(n>0) {
    while (!arduboy.nextFrame()) delay(1);
    --n;
  }
}

boolean game_play() {
////// FUNCTION BODY //////
int h = HEIGHT - GFX_DINO_HEIGHT;
int din_y = h;
int dir_y = -1;
while (true) {
  arduboy.clear();
  
arduboy.setCursor( 40, 10 );
arduboy.print( itoa(din_y, _microcanvas_textbuffer, 10) );
  arduboy.drawBitmap( 0, din_y, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
  _microcanvas_yield(1);
  din_y += dir_y;
  if (din_y == 0 || din_y == h) dir_y *= -1;
}
return 1;

}
boolean game_over() {
////// FUNCTION BODY //////


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
if (_microcanvas_state == S_PLAYING) {
  int ended = game_play();
  if (!ended) return;
  _microcanvas_state = S_GAMEOVER;
  return;
}
if (_microcanvas_state == S_GAMEOVER) {
  int ended = game_over();
  if (arduboy.pressed( B_BUTTON )) ended = true;
  if (!ended) return;
}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

