#include <SPI.h>
#include "Arduboy.h"

Arduboy arduboy;



PROGMEM const unsigned char gfx_blobs[] = { /*5x5x4*/ 0x00, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x04, 0x0e, 0x04, 0x00, 0x00, 0x0e, 0x1f, 0x0e, 0x00, 0x0e, 0x1f, 0x1f, 0x1f, 0x0e };

const byte GFX_BLOBS_WIDTH = 5;
const byte GFX_BLOBS_HEIGHT = 5;
const byte GFX_BLOBS_FRAMES = 4;
const byte GFX_BLOBS_FRAMESIZE = 5;



void setup() {
  arduboy.begin();
}

void loop() {
  int i = 0;

  while(1) {

    arduboy.drawBitmap( 16, 16, gfx_blobs + GFX_BLOBS_FRAMESIZE*i, GFX_BLOBS_WIDTH, GFX_BLOBS_HEIGHT, WHITE );

	arduboy.display();
    delay(3);

    if (++i > GFX_BLOBS_FRAMES) {
      i = 0;
      arduboy.clear();
    }
  }
}
