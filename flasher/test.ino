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
  for(int i = -8; i < 26; i = i + 1)
  {
    arduboy.clearDisplay();
    arduboy.setCursor(46, i);
    arduboy.print("AVRGIRL");
    arduboy.setCursor(16, 64-i);
    arduboy.print("clouduboy-flasher");
    arduboy.display();

    while (!(arduboy.nextFrame()))
      delay(1);
  }

  // intro tune
  arduboy.tunes.tone(1174, 140);
  delay(140);
  arduboy.tunes.tone(1290, 140);
  delay(140);
  arduboy.tunes.tone(1174, 140);
  delay(140);

  arduboy.tunes.tone(1070, 210);
  delay(210);
  arduboy.tunes.tone(1244, 140);
  delay(140);
  arduboy.tunes.tone(1396, 400);
  delay(600);
}

// simple button polling
void inputPoll() {
  pressed_A |= arduboy.pressed(A_BUTTON);
  pressed_B |= arduboy.pressed(B_BUTTON);
}

void inputReset() {
  pressed_A = pressed_B = false;
}
