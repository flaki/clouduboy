#include "Arduboy.h"

Arduboy arduboy;

boolean started = false;

boolean pressed_A = false;
boolean pressed_B = false;

// Setup
void setup()
{
  arduboy.start();
  arduboy.setFrameRate(60);

  intro();
}

void loop()
{
  inputPoll();

  // wait for next frame
  if (!(arduboy.nextFrame()))
    return;

  // press A or B to start
  if (!started && (pressed_A || pressed_B))
    started = true;

  // loop to run if started
  while (started)
  {
    // clear screen
    arduboy.clearDisplay();

    // draw
    // ...

    // display
    arduboy.display();
  }

  inputReset();
}

// simple intro animation
void intro()
{
  for(int i = -8; i < 28; i = i + 1)
  {
    arduboy.clearDisplay();
    arduboy.setCursor(46, i);
    arduboy.print("ARDUBOY");
    arduboy.display();

    while (!(arduboy.nextFrame()))
      delay(1);
  }

  // intro tune
  arduboy.tunes.tone(987, 160);
  delay(160);
  arduboy.tunes.tone(1318, 400);
  delay(2000);
}

// simple button polling
void inputPoll() {
  pressed_A |= arduboy.pressed(A_BUTTON);
  pressed_B |= arduboy.pressed(B_BUTTON);
}

void inputReset() {
  pressed_A = pressed_B = false;
}
