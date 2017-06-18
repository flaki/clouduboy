#include <stdio.h>

// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

int main() {
    while (_microcanvas_frame_counter < 70) {
        printf("%2d -> %d\n", _microcanvas_frame_counter, abs( _microcanvas_frame_counter % 30 / 5 - 3 ) );
        ++_microcanvas_frame_counter;
    }
 }
