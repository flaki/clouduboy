#include "Arduboy.h"

Arduboy arduboy;


// Setup
void setup()
{
  arduboy.start();
  arduboy.setFrameRate(60);
  arduboy.clearDisplay();

  // ...
}

void loop()
{
  // wait for next frame
  if (!(arduboy.nextFrame()))
    return;

  // ...
}
