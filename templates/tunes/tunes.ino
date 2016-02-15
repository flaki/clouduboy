#include <SPI.h>
#include "Arduboy.h"

// Polyphonic music data to be played with Arduboy's audio.cpp::playScore lib
const byte PROGMEM score [] = {
  3,0,
     0x90, 48, 1,0, 0x80, 0,32,
     0x90, 48, 0,128, 0x80, 0,32,
     0x90, 50, 1,128, 0x80, 0,32,
     0x90, 48, 1,128, 0x80, 0,32,
     0x90, 53, 1,128, 0x80, 0,32,
     0x90, 52, 3,0, 0x80, 0,32,
  1,128,
     0x90, 48, 1,0, 0x80, 0,32,
     0x90, 48, 0,128, 0x80, 0,32,
     0x90, 50, 1,128, 0x80, 0,32,
     0x90, 48, 1,128, 0x80, 0,32,
     0x90, 55, 1,128, 0x80, 0,32,
     0x90, 53, 3,0, 0x80, 0,32,
  1,128,
  0xf0
};

Arduboy arduboy;


// Display a splash screen
void setup() {
  SPI.begin();
  arduboy.start();
  arduboy.setTextSize(4);
  arduboy.setCursor(0,0);
  arduboy.print("Music\nDemo");
  arduboy.display();
}

void loop () {
  // pause render until it's time for the next frame
  if (!(arduboy.nextFrame()))
    return;

  // play the tune if we aren't already
  if (!arduboy.tunes.playing())
    arduboy.tunes.playScore(score);

}
