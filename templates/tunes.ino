#include <SPI.h>
#include "Arduboy.h"

// Polyphonic music data to be played with Arduboy's audio.cpp::playScore lib
const byte PROGMEM score [] = {
  7,208,
  0x90,0x45,
  0x91,0x39,
  1,77,
  0x80, 0x81,
  0x90,0x44,
  0,166,
  0x80,
  0x90,0x45,
  0,166,
  0x80,
  7,83,
  0x80, 0x81,
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
