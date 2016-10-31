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



const byte PROGMEM sfx_score[] = { 3,0, 0x90, 48, 1,0, 0x80, 0,32, 0x90, 48, 0,128, 0x80, 0,32, 0x90, 50, 1,128, 0x80, 0,32, 0x90, 48, 1,128, 0x80, 0,32, 0x90, 53, 1,128, 0x80, 0,32, 0x90, 52, 3,0, 0x80, 0,32, 1,128, 0x90, 48, 1,0, 0x80, 0,32, 0x90, 48, 0,128, 0x80, 0,32, 0x90, 50, 1,128, 0x80, 0,32, 0x90, 48, 1,128, 0x80, 0,32, 0x90, 55, 1,128, 0x80, 0,32, 0x90, 53, 3,0, 0x80, 0,32, 1,128, 0xf0 };





void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////

}


void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
if (!arduboy.tunes.playing()) arduboy.tunes.playScore( sfx_score );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

