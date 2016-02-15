#include "Arduboy.h"


// Pre-drawn pixelart animation - Flappy Bat (17x7, 2 frames)
PROGMEM const unsigned char sprite1[] = { /*17x7*/ 0x1c, 0x0e, 0x0c, 0x07, 0x0e, 0x0c, 0x1b, 0x3e, 0x3e, 0x1b, 0x0c, 0x06, 0x0f, 0x1c, 0x0e, 0x1c, 0x38 };

PROGMEM const unsigned char sprite2[] = { /*17x7*/ 0x01, 0x0f, 0x0e, 0x1c, 0x38, 0x3c, 0x1b, 0x3e, 0x3e, 0x1b, 0x3c, 0x38, 0x1c, 0x0e, 0x0f, 0x01, 0x00 };


Arduboy arduboy;

int animationSpeed = 18;

int animFrame = 0;
int cSprite = 0;

void setup() {
  arduboy.start();
  arduboy.setTextSize(3);
  arduboy.setCursor(0,0);
  arduboy.print("Sprite\nDemo");
  arduboy.display();
}

int x = 0, y = 24;
int sx = 1, sy = 1;


void loop () {
  // pause render until it's time for the next frame
  if (!(arduboy.nextFrame()))
    return;

  // Update flapping animation
  if (--animFrame <= 0) {
    animFrame = animationSpeed;
    cSprite = !cSprite;
  }

  // Update position
  x += sx;
  y += sy;

  if (x>108 || x<1) sx = -sx;
  if (y>56 || y<1) sy = -sy;


  // Clear display, redraw background text
  arduboy.clearDisplay();
  arduboy.setCursor(0,0);
  arduboy.print("Sprite\nDemo");

  // Draw shadow
  arduboy.drawBitmap(0 +x,2 +y, cSprite ? sprite1 : sprite2, 17,7, BLACK);
  arduboy.drawBitmap(2 +x,2 +y, cSprite ? sprite1 : sprite2, 17,7, BLACK);

  // Draw Bat
  arduboy.drawBitmap(1 +x,1 +y, cSprite ? sprite1 : sprite2, 17,7, WHITE);

  // Update Screen
  arduboy.display();
}
