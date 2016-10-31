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





void my_function(int my_param) {
////// FUNCTION BODY //////
return my_param + 1;

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
int local_var = my_function( 7 );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
