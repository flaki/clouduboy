#include <SPI.h>
#include "Arduboy.h"

// Multichannel background music
const byte PROGMEM score [] = {
  3,0,
  0x91, 62,
  0x90, 71, 1, 128, 0x80, 0, 16,
  0x90, 71, 1, 128, 0x80, 0, 16,
  0x90, 72, 1, 128, 0x80, 0, 16,
  0x90, 74, 1, 128, 0x80, 0, 16,
  0x81,
  0x91, 57,
  0x90, 74, 1, 128, 0x80, 0, 16,
  0x90, 72, 1, 128, 0x80, 0, 16,
  0x90, 71, 1, 128, 0x80, 0, 16,
  0x90, 69, 1, 128, 0x80, 0, 16,
  0x81,
  0x90, 67, 1, 128, 0x80, 0, 16,
  0x90, 67, 1, 128, 0x80, 0, 16,
  0x90, 69, 1, 128, 0x80, 0, 16,
  0x90, 71, 1, 128, 0x80, 0, 16,
  0x90, 71, 2, 128, 0x80, 0, 16,
  0x90, 69, 0, 128, 0x80, 0, 16,
  0x90, 69, 2, 128, 0x80,
  0xf0
};//🎹


// Animated sprites (17x7, 2 frames)
PROGMEM const unsigned char sprite1[] = { /*17x11*/ 0x4, 0x1c, 0x38, 0x98, 0xd2, 0xfa, 0xd2, 0x98, 0x38, 0x1c, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x3, 0x1, 0x3, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 };

PROGMEM const unsigned char sprite2[] = { /*17x11*/ 0x0, 0x60, 0x30, 0xb8, 0xd2, 0xfa, 0xd2, 0xb8, 0x30, 0x60, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x3, 0x1, 0x3, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 };



Arduboy arduboy;


// Display a splash screen
void setup() {
  SPI.begin();
  arduboy.start();
  arduboy.setTextSize(1);
}

byte z = 48;

int x = 0, y = 24;
int sx = 1, sy = 1;

int cSprite = 0;

void loop () {
  // pause render until it's time for the next frame
  if (!(arduboy.nextFrame()))
    return;

  // Animate background text
  if (arduboy.everyXFrames(30) && z > 0) {
    --z;
  }

  // Animate angel sprite
  if (arduboy.everyXFrames(15)) {
    cSprite = !cSprite;
  }

  // Update sprite position
  x += sx;
  y += sy;

  if (x>108 || x<1) sx = -sx;
  if (y>56 || y<1) sy = -sy;

  // Display background text
  arduboy.clearDisplay();
  arduboy.setCursor(0,z);
  arduboy.print("Freude, sch\x94ner G\x94tterfunken,\nTochter aus Elysium,");

  // Draw shadow/stroke for sprite
  arduboy.drawBitmap(0 +x,2 +y, cSprite ? sprite1 : sprite2, 17,7, BLACK);
  arduboy.drawBitmap(2 +x,2 +y, cSprite ? sprite1 : sprite2, 17,7, BLACK);

  // Draw sprite
  arduboy.drawBitmap(1 +x,1 +y, cSprite ? sprite1 : sprite2, 17,7, WHITE);

  arduboy.display();


  // play the tune if we aren't already
  if (!arduboy.tunes.playing())
    arduboy.tunes.playScore(score);

}
