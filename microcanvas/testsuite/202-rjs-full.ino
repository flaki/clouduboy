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


PROGMEM const unsigned char gfx_rjs[] = { /*78x15*/ 0xfe, 0x01, 0xfe, 0x02, 0x85, 0x85, 0x05, 0xc5, 0xb9, 0xc2, 0x3c, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0x7e, 0x40, 0x40, 0x40, 0x40, 0x80, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x02, 0x85, 0x85, 0x05, 0xc5, 0xbb, 0xc6, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x01, 0xfe, 0x00, 0x00, 0x00, 0x1c, 0x26, 0x5a, 0x97, 0xa0, 0xa3, 0xa5, 0x45, 0xcb, 0x8a, 0x0c, 0x3f, 0x40, 0x3f, 0x01, 0x02, 0x05, 0x0b, 0x16, 0x2c, 0x58, 0x30, 0x00, 0x00, 0x00, 0x01, 0x1b, 0x29, 0x28, 0x50, 0x50, 0x50, 0x28, 0x27, 0x18, 0x07, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x40, 0x3f, 0x01, 0x01, 0x01, 0x01, 0x00, 0x3f, 0x40, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x40, 0x3f, 0x01, 0x02, 0x05, 0x0b, 0x16, 0x2c, 0x58, 0x30, 0x00, 0x00, 0x20, 0x50, 0x50, 0x28, 0x27, 0x10, 0x0f, 0x00, 0x00, 0x00, 0x0c, 0x14, 0x2c, 0x28, 0x50, 0x50, 0x60, 0x1b, 0x34, 0x39, 0x0f };

PROGMEM const unsigned char gfx_rjs_logo[] = { /*39x36*/ 0x00, 0x00, 0x00, 0x00, 0xc0, 0x60, 0xb0, 0x50, 0x28, 0x2c, 0x14, 0x8a, 0x8a, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0xa5, 0x8a, 0x8a, 0x14, 0x2c, 0x28, 0x50, 0xb0, 0x60, 0xc0, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x38, 0xc6, 0x3b, 0x04, 0x03, 0x00, 0x00, 0x00, 0x00, 0xc1, 0x62, 0x32, 0xfa, 0x0a, 0xfa, 0x32, 0x62, 0x42, 0x02, 0x42, 0x62, 0x32, 0xfa, 0x0a, 0xfa, 0x32, 0x62, 0xc1, 0x00, 0x00, 0x00, 0x00, 0x03, 0x04, 0x3b, 0xc6, 0x38, 0xc0, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x83, 0x70, 0x8f, 0x70, 0x0d, 0x05, 0x7d, 0x7d, 0x05, 0x7d, 0x7d, 0x05, 0x0d, 0x70, 0x8f, 0x70, 0x83, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0x07, 0x18, 0x27, 0x5c, 0xb0, 0xe0, 0x00, 0xc0, 0x30, 0xce, 0x31, 0x0e, 0x01, 0x00, 0x01, 0x01, 0xff, 0xff, 0x01, 0xff, 0xff, 0x01, 0x01, 0x00, 0x01, 0x0e, 0x31, 0xce, 0x30, 0xc0, 0x00, 0xe0, 0xb0, 0x5c, 0x27, 0x18, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0e, 0x09, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x06, 0x09, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

PROGMEM const unsigned char gfx_dino[] = { /*20x24*/ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xfb, 0xff, 0xff, 0xbf, 0xbf, 0xbf, 0x3f, 0x3e, 0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x7f, 0x04, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x03, 0x07, 0x7f, 0x5f, 0x0f, 0x07, 0x0f, 0x7f, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

PROGMEM const unsigned char gfx_dino_eek[] = { /*20x24*/ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xf5, 0xfb, 0xb5, 0xdf, 0x5f, 0x5f, 0x5f, 0x1f, 0x1e, 0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x7f, 0x04, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x03, 0x07, 0x7f, 0x5f, 0x0f, 0x07, 0x0f, 0x7f, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

PROGMEM const unsigned char gfx_dino_legs[] = { /*20x5x2*/ 0x00, 0x00, 0x00, 0x00, 0x01, 0x0f, 0x0b, 0x01, 0x01, 0x03, 0x1f, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 , 0x00, 0x00, 0x00, 0x00, 0x01, 0x1f, 0x17, 0x03, 0x01, 0x03, 0x0f, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

PROGMEM const unsigned char gfx_dino_kaput[] = { /* 30x18 */ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7e, 0xf8, 0xf0, 0xe0, 0xe0, 0xf0, 0xf0, 0xf8, 0xf8, 0xf8, 0xf8, 0xf0, 0xf0, 0xf0, 0xe0, 0xe0, 0xc0, 0xc0, 0x80, 0xc0, 0xf0, 0xa8, 0xd8, 0xa8, 0xf8, 0xf8, 0xf8, 0xf8, 0xf8, 0xf0, 0x00, 0x00, 0x01, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x01, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x01 };

PROGMEM const unsigned char gfx_clouds[] = { /* 20x16x1 */ 0x1c, 0x22, 0x22, 0x22, 0x24, 0x10, 0x12, 0x2a, 0x21, 0x41, 0x41, 0x41, 0x42, 0x4a, 0x24, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, };

PROGMEM const unsigned char gfx_cactus[] = { /* 16x24x2 */ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xff, 0xfe, 0x00, 0xc0, 0xc0, 0x80, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xfe, 0x00, 0xff, 0xff, 0xff, 0xff, 0xc0, 0xff, 0xff, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x01, 0x03, 0x03, 0x83, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00 , 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xcf, 0x9e, 0xf0, 0xf8, 0xfc, 0xfc, 0xb8, 0x80, 0xf0, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0d, 0x8b, 0xbf, 0xff, 0xff, 0xbf, 0x8f, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };


const byte PROGMEM sfx_bling[] = { 0x90, 71, 0,116, 0x80, 0x90, 76, 1,222, 0x80, 0xf0 };

const byte PROGMEM sfx_plop[] = { 0x90, 47, 0, 16, 0x91, 41, 0, 16, 0x80, 0, 35, 0x81, 0xf0 };

const byte PROGMEM sfx_boing[] = { 0x90, 57, 0, 33, 0x80, 0x90, 69, 0, 83, 0x80, 0xf0 };

const byte PROGMEM sfx_eek[] = { 0x90, 87, 0,50, 0x80, 0x90, 82, 0,33, 0x80, 0x90, 87, 0,66, 0x80, 0xf0 };

const byte PROGMEM sfx_bust[] = { 0x90, 47, 0, 50, 0x80, 0x90, 41, 0, 99, 0x80, 0xf0 };

const byte S_INTRO = 1;
const byte S_PLAYING = 2;
const byte S_GAMEOVER = 3;
const byte START_SPEED = 75;
const byte GFX_RJS_WIDTH = 78;
const byte GFX_RJS_HEIGHT = 15;
const byte GFX_RJS_FRAMES = 0;
const byte GFX_RJS_FRAMESIZE = 156;
const byte GFX_RJS_LOGO_WIDTH = 39;
const byte GFX_RJS_LOGO_HEIGHT = 36;
const byte GFX_RJS_LOGO_FRAMES = 0;
const byte GFX_RJS_LOGO_FRAMESIZE = 195;
const byte GFX_DINO_WIDTH = 20;
const byte GFX_DINO_HEIGHT = 24;
const byte GFX_DINO_FRAMES = 0;
const byte GFX_DINO_FRAMESIZE = 60;
const byte GFX_DINO_EEK_WIDTH = 20;
const byte GFX_DINO_EEK_HEIGHT = 24;
const byte GFX_DINO_EEK_FRAMES = 0;
const byte GFX_DINO_EEK_FRAMESIZE = 60;
const byte GFX_DINO_LEGS_WIDTH = 20;
const byte GFX_DINO_LEGS_HEIGHT = 5;
const byte GFX_DINO_LEGS_FRAMES = 2;
const byte GFX_DINO_LEGS_FRAMESIZE = 20;
const byte GFX_DINO_KAPUT_WIDTH = 30;
const byte GFX_DINO_KAPUT_HEIGHT = 18;
const byte GFX_DINO_KAPUT_FRAMES = 0;
const byte GFX_DINO_KAPUT_FRAMESIZE = 90;
const byte GFX_CLOUDS_WIDTH = 20;
const byte GFX_CLOUDS_HEIGHT = 16;
const byte GFX_CLOUDS_FRAMES = 1;
const byte GFX_CLOUDS_FRAMESIZE = 40;
const byte GFX_CACTUS_WIDTH = 16;
const byte GFX_CACTUS_HEIGHT = 24;
const byte GFX_CACTUS_FRAMES = 2;
const byte GFX_CACTUS_FRAMESIZE = 48;

int baseline;
int baseline_dino;
int distance;
int obs_cactus_1;
int obs_cactus_2;
int obs_cactus_1_y;
int obs_cactus_2_y;
int obs_cactus_1_y_type;
int obs_cactus_2_y_type;
int dino_jump_frame;
int dino_jump_height = 0;
int dino_run_speed;
int calculate_next_step_remainder = 0;

void _microcanvas_yield(byte n) {
  arduboy.display();
  while(n>0) {
    while (!arduboy.nextFrame()) delay(1);
    --n;
  }
}

boolean collides(const unsigned char* gfx1, int x1,int y1, const unsigned char* gfx2, int x2,int y2) {
  return false;
}

boolean game_intro() {
////// FUNCTION BODY //////
for (int y = -8; y <= 38; y += 2) {
  arduboy.clear();
  arduboy.drawBitmap( 44, 0, gfx_rjs_logo, GFX_RJS_LOGO_WIDTH, GFX_RJS_LOGO_HEIGHT, WHITE );
  arduboy.drawBitmap( 25, y, gfx_rjs, GFX_RJS_WIDTH, GFX_RJS_HEIGHT, WHITE );
  _microcanvas_yield(1);
}
{
arduboy.setCursor( 42, 55 );
arduboy.print( "presents" );
};
arduboy.tunes.playScore( sfx_bling );
arduboy.setRGBled(96, 0, 128);
_microcanvas_yield(6);
arduboy.setRGBled(0, 0, 0);
_microcanvas_yield(60);
int y = 12;
arduboy.drawBitmap( 54 - 2, y - 1, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
arduboy.drawBitmap( 54 + 1, y + 1, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
for (int frame = 0; frame < 36; ++frame) {
  int rx = random( 0, 2 ) - 1;
  int ry = random( 0, 2 ) - 1;
  int noise = 0;
  if (frame % 3 == 0) {
  arduboy.drawBitmap( rx + 54, ry + y, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
} else {
  arduboy.drawBitmap( rx + 54 + noise, ry + y + noise, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
}
  _microcanvas_yield(1);
}
while (y < baseline_dino) {
  y += 1 + y / 10;
  if (y > baseline_dino) y = baseline_dino;
  arduboy.clear();
  arduboy.drawBitmap( 44, 0, gfx_rjs_logo, GFX_RJS_LOGO_WIDTH, GFX_RJS_LOGO_HEIGHT, WHITE );
  arduboy.drawBitmap( 25, 38, gfx_rjs, GFX_RJS_WIDTH, GFX_RJS_HEIGHT, WHITE );
  {
arduboy.setCursor( 42, 55 );
arduboy.print( "pr   nts" );
};
  {
arduboy.setCursor( 54, 55 + (y > 32 ? y - 32 : 0) );
arduboy.print( "ese" );
};
  arduboy.drawBitmap( 54 - 2, y - 1, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
  arduboy.drawBitmap( 54 + 1, y + 1, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
  arduboy.drawBitmap( 54, y, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
  _microcanvas_yield(1);
}
arduboy.tunes.playScore( sfx_plop );
_microcanvas_yield(120);
for (int i = 0; i < 64; ++i) {
  int z = (i < 54 ? i : 54);
  arduboy.drawBitmap( 54 - z + 1, y, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, BLACK );
  arduboy.fillRect( 0, (i < 32 ? i * 2 : 127 - i * 2), 128, 1, BLACK );
  arduboy.drawBitmap( 54 - z, y, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
  _microcanvas_yield(1);
}
_microcanvas_yield(10);

}
int calculate_next_step(int run_speed) {
////// FUNCTION BODY //////
int next = run_speed / 60 | 0;
calculate_next_step_remainder += 100 * run_speed / 60 % 100 | 0;
while (calculate_next_step_remainder > 50) {
  next++;
  calculate_next_step_remainder -= 100;
}
return next;

}
int calculate_run_speed(int distance, int next_step) {
////// FUNCTION BODY //////
return START_SPEED + distance + next_step / 100 | 0 + distance + next_step / 500 | 0 * 4;

}
boolean game_play() {
////// FUNCTION BODY //////
int next_step;
game_setup();
while (true) {
  arduboy.clear();
  next_step = calculate_next_step( dino_run_speed );
  if (next_step) {
  dino_run_speed = calculate_run_speed( distance, next_step );
  distance += next_step;
}
  update_terrain( distance );
  update_dino();
  arduboy.clear();
  draw_terrain( distance );
  draw_dino();
  draw_u_i();
  if (check_collisions()) break;
  _microcanvas_yield(1);
}

}
boolean game_over() {
////// FUNCTION BODY //////
arduboy.tunes.playScore( sfx_eek );
for (int i = 0; i < 24; i++) {
  arduboy.clear();
  draw_terrain( 0 );
  if (i != 7 && i != 8 && i != 16 && i != 17) {
  arduboy.drawBitmap( 0, baseline_dino - dino_jump_height, gfx_dino_eek, GFX_DINO_EEK_WIDTH, GFX_DINO_EEK_HEIGHT, WHITE );
}
  draw_u_i();
  check_collisions();
  _microcanvas_yield(1);
}
int falling = true;
int next_step;
int fall_distance = distance;
while (true) {
  if (dino_jump_height > -4) {
  dino_jump_height -= 1;
}
  if (falling && dino_jump_height <= -4) {
  dino_jump_height = -4;
  arduboy.tunes.playScore( sfx_bust );
  falling = false;
}
  if (dino_run_speed > 0) {
  next_step = calculate_next_step( dino_run_speed );
  dino_run_speed -= 1;
  fall_distance += next_step;
}
  arduboy.clear();
  update_terrain( fall_distance );
  draw_terrain( fall_distance );
  arduboy.drawBitmap( 0, baseline_dino - dino_jump_height, gfx_dino_kaput, GFX_DINO_KAPUT_WIDTH, GFX_DINO_KAPUT_HEIGHT, WHITE );
  draw_u_i();
  _microcanvas_yield(1);
}

}
void game_setup() {
////// FUNCTION BODY //////
_microcanvas_state = S_PLAYING;
distance = 0;
dino_run_speed = START_SPEED;
obs_cactus_1 = obs_cactus_2 = -WIDTH;
update_terrain( distance );
dino_jump_frame = 0;
dino_jump_height = 0;

}
void update_terrain(int distance) {
////// FUNCTION BODY //////
if (obs_cactus_1 + GFX_CACTUS_WIDTH < distance) {
  obs_cactus_1 = distance + 175 + 5 * random( 1, 10 );
  obs_cactus_1_y = random( baseline + 1, HEIGHT ) - GFX_CACTUS_HEIGHT;
}
if (distance > 500) {
  if (obs_cactus_2 + GFX_CACTUS_WIDTH < distance) {
  obs_cactus_2 = distance + 200 + 6 * random( 1, 10 );
  obs_cactus_2_y = random( baseline + 1, HEIGHT ) - GFX_CACTUS_HEIGHT;
}
  int obs_distance = obs_cactus_2 - obs_cactus_1;
  if (obs_distance > 0 && obs_distance < GFX_CACTUS_WIDTH / 2) {
  obs_cactus_2 += GFX_CACTUS_WIDTH / 2 | 0;
}
  if (obs_distance < 0 && obs_distance > GFX_CACTUS_WIDTH / -2) {
  obs_cactus_1 += GFX_CACTUS_WIDTH / 2 | 0;
}
  obs_distance = obs_cactus_2 - obs_cactus_1;
  if (obs_distance > GFX_CACTUS_WIDTH + 5 && obs_distance < GFX_CACTUS_WIDTH + GFX_DINO_WIDTH) {
  obs_cactus_2 += GFX_DINO_WIDTH;
}
  if (obs_distance < -GFX_CACTUS_WIDTH + 5 && obs_distance > -GFX_CACTUS_WIDTH + GFX_DINO_WIDTH) {
  obs_cactus_1 += GFX_DINO_WIDTH;
}
}

}
void update_dino() {
////// FUNCTION BODY //////
if (_microcanvas_state == S_PLAYING) {
  if (!dino_jump_frame && arduboy.pressed( A_BUTTON ) || arduboy.pressed( UP_BUTTON )) {
  dino_jump_frame = 1;
  dino_jump_height = 5;
  arduboy.tunes.playScore( sfx_boing );
} else if (dino_jump_frame) {
  ++dino_jump_frame;
  if (dino_jump_frame < 6) {
  dino_jump_height += 6;
} else if (dino_jump_frame < 9) {
  dino_jump_height += 2;
} else if (dino_jump_frame < 13) {
  dino_jump_height += 1;
} else if (dino_jump_frame == 16 || dino_jump_frame == 18) {
  dino_jump_height += 1;
} else if (dino_jump_frame == 20 || dino_jump_frame == 22) {
  dino_jump_height -= 1;
} else if (dino_jump_frame > 38) {
  dino_jump_height = 0;
  dino_jump_frame = 0;
} else if (dino_jump_frame > 32) {
  dino_jump_height -= 6;
} else if (dino_jump_frame > 29) {
  dino_jump_height -= 2;
} else if (dino_jump_frame > 25) {
  dino_jump_height -= 1;
}
}
}

}
void draw_terrain(int distance) {
////// FUNCTION BODY //////
arduboy.drawBitmap( WIDTH - distance % WIDTH + GFX_CLOUDS_WIDTH, 5, gfx_clouds + GFX_CLOUDS_FRAMESIZE*(0), GFX_CLOUDS_WIDTH, GFX_CLOUDS_HEIGHT, WHITE );
if (dino_jump_height > 4) {
  arduboy.fillRect( 0, baseline, 128, 1, WHITE );
} else {
  arduboy.fillRect( 0, baseline, 4, 1, WHITE );
  arduboy.fillRect( 12, baseline, 116, 1, WHITE );
}
int c_1 = obs_cactus_1 - distance;
int c_2 = obs_cactus_2 - distance;
if (c_1 < WIDTH) arduboy.drawBitmap( c_1, obs_cactus_1_y, gfx_cactus + GFX_CACTUS_FRAMESIZE*(0), GFX_CACTUS_WIDTH, GFX_CACTUS_HEIGHT, WHITE );
if (c_2 < WIDTH) arduboy.drawBitmap( c_2, obs_cactus_2_y, gfx_cactus + GFX_CACTUS_FRAMESIZE*(1), GFX_CACTUS_WIDTH, GFX_CACTUS_HEIGHT, WHITE );

}
void draw_dino() {
////// FUNCTION BODY //////
int dy = baseline_dino - dino_jump_height;
arduboy.drawBitmap( 0, 0, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
if (!dino_jump_height) {
  arduboy.drawBitmap( 0, dy + 18, gfx_dino_legs + GFX_DINO_LEGS_FRAMESIZE*(distance / 10 | 0 % 2), GFX_DINO_LEGS_WIDTH, GFX_DINO_LEGS_HEIGHT, WHITE );
} else {
  arduboy.drawBitmap( 0, 18, gfx_dino, GFX_DINO_WIDTH, GFX_DINO_HEIGHT, WHITE );
}

}
void draw_u_i() {
////// FUNCTION BODY //////
arduboy.setCursor( 0, 0 );
arduboy.print( sprintf(_microcanvas_textbuffer, "DIST: %d SPD: %d", distance / 10 | 0, dino_run_speed ) );
if (arduboy.everyXFrames( 5 )) {
  if (arduboy.pressed( LEFT_BUTTON )) {
  {
arduboy.setCursor( 80, 50 );
arduboy.print( "<" );
};
}
  if (arduboy.pressed( RIGHT_BUTTON )) {
  {
arduboy.setCursor( 93, 50 );
arduboy.print( ">" );
};
}
  if (arduboy.pressed( UP_BUTTON )) {
  {
arduboy.setCursor( 84, 45 );
arduboy.print( "/\\" );
};
}
  if (arduboy.pressed( DOWN_BUTTON )) {
  {
arduboy.setCursor( 84, 55 );
arduboy.print( "\\/" );
};
}
  if (arduboy.pressed( A_BUTTON )) {
  {
arduboy.setCursor( 102, 50 );
arduboy.print( "A" );
};
}
  if (arduboy.pressed( B_BUTTON )) {
  {
arduboy.setCursor( 110, 50 );
arduboy.print( "B" );
};
}
}

}
int check_collisions() {
////// FUNCTION BODY //////
int c_1 = obs_cactus_1 - distance;
int c_2 = obs_cactus_2 - distance;
int dy = baseline_dino - dino_jump_height;
int hit = false;
hit = hit || c_1 <= GFX_DINO_WIDTH && collides( gfx_dino, 0, dy, gfx_cactus + GFX_CACTUS_FRAMESIZE*(0), c_1, obs_cactus_1_y ) || c_2 <= GFX_DINO_WIDTH && collides( gfx_dino, 0, dy, gfx_cactus + GFX_CACTUS_FRAMESIZE*(1), c_2, obs_cactus_1_y );
return hit;

}


void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////
baseline = HEIGHT - 5;
baseline_dino = HEIGHT - GFX_DINO_HEIGHT;
_microcanvas_state = S_INTRO;
}


void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.setFrameRate( round( 60 * (arduboy.pressed( DOWN_BUTTON ) ? 1 / 4 : 1) ) );
if (_microcanvas_state == S_INTRO) {
  if (arduboy.pressed( B_BUTTON )) return game_setup();
  int ended = game_intro();
  if (!ended) return;
  return game_setup();
}
if (_microcanvas_state == S_PLAYING) {
  int ended = game_play();
  if (!ended) return;
  _microcanvas_state = S_GAMEOVER;
  return;
}
if (_microcanvas_state == S_GAMEOVER) {
  int ended = game_over();
  if (arduboy.pressed( B_BUTTON )) ended = true;
  if (!ended) return;
  return game_setup();
}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
