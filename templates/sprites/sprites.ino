#include "Arduboy.h"


// Pre-drawn pixelart animation - Flappy Bat (16x6, 2 frames)
PROGMEM const unsigned char bats[] = { /*16x6x2*/
  0x01, 0x0f, 0x0e, 0x1c, 0x38, 0x3c, 0x1b, 0x3e,
  0x3e, 0x1b, 0x3c, 0x38, 0x1c, 0x0e, 0x0f, 0x01,
  0x1c, 0x0e, 0x0c, 0x07, 0x0e, 0x0c, 0x1b, 0x3e,
  0x3e, 0x1b, 0x0c, 0x0e, 0x07, 0x0c, 0x0e, 0x1c,
};


// Initialize Arduboy
Arduboy arduboy;

void setup() {
  arduboy.begin();
}


// Local vars
int x = 0, y = 24;
int sx = 1, sy = 1;

int animationSpeed = 8;
int cSprite = 0;


// Main loop
void loop () {
  // Ensure correct frame rate
  if (!(arduboy.nextFrame()))
    return;


  // Update flapping animation
  if (arduboy.everyXFrames(animationSpeed)) {
    cSprite = !cSprite;
  }

  // Update position
  x += sx;
  y += sy;

  if (x>108 || x<1) sx = -sx;
  if (y>56 || y<1) sy = -sy;


  // Clear display, redraw background text
  arduboy.clear();

  // Background text
  arduboy.setTextSize(3);
  arduboy.setCursor(0,0);
  arduboy.print("Sprite\nDemo");

  // Draw shadow
  arduboy.drawBitmap(0 +x,2 +y, bats +cSprite*16, 16,6, BLACK);
  arduboy.drawBitmap(2 +x,2 +y, bats +cSprite*16, 16,6, BLACK);

  // Draw Bat
  arduboy.drawBitmap(1 +x,1 +y, bats +cSprite*16, 16,6, WHITE);


  // Update Screen
  arduboy.display();
}
