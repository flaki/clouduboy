## Micro wiring - ssd1306_128x64_spi.ino

```
Pin   Wire    SW      HW      Devkit  Arduboy
- Screen -----------------------------------------
GND   Black   ground  ground  ground  ground
VCC   White   5V      5V      5V      5V
CLK   Grey    D10     SCK     SCK     SCK
MOSI  Purple  D9      MOSI    MOSI    MOSI
 DC   Blue    D11     D6      D4      ?
 CS   Green   D12     D7      D6      ?
RST   -----   D13     D8      D12     ?
- Buzzer -----------------------------------------
GND   Gray    -       -       ground  ground
CH0   Green   -       -       A2      5 (D5)
CH1   Green   -       -       A3      13
- Buttons ----------------------------------------
UP    -                               A0                               
DN    -                               A3
LFT   -                               A2
RGT   -                               A1
 A    -                               7 (D7)
 B    -                               8 (D8)
```

```
```
* Pull-up resistors: https://learn.sparkfun.com/tutorials/pull-up-resistors
* Diode-based logic gates: https://learn.sparkfun.com/tutorials/diodes

* Arduino Micro pinout:
  - http://pighixxx.com/micropdf.pdf
  - https://www.arduino.cc/en/uploads/Main/ArduinoMicro_Pinout3.png

* Screen tutorial & wiring guide: https://learn.adafruit.com/monochrome-oled-breakouts/
* Push button guide: https://www.arduino.cc/en/Tutorial/Pushbutton
* SPI library: https://www.arduino.cc/en/Reference/SPI
* DevKit pinout/wiring: http://community.arduboy.com/t/12-arduboy-compatible-system/236/5

## AVR for ARM:

* Atmel AVR toolchain: http://www.atmel.com/webdoc/AVRLibcReferenceManual/overview_1overview_binutils.html
* Cross-compiling the toolchain: http://www.ethernut.de/en/documents/cross-toolchain-osx.html


## Arduino IDE Sample compile/upload output:

```
Using library SPI in folder: /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI
Using library Wire in folder: /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire
Using library Adafruit GFX Library in folder: /Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library
Using library Adafruit SSD1306 in folder: /Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306

/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI/utility /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI/SPI.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/SPI/SPI.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire/utility /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire/Wire.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Wire/Wire.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire/utility /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire/utility/twi.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Wire/utility/twi.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library/utility /Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library/glcdfont.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit GFX Library/glcdfont.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library/utility /Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library/Adafruit_GFX.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit GFX Library/Adafruit_GFX.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/SPI -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/libraries/Wire -I/Users/flaki/Documents/Arduino/libraries/Adafruit_GFX_Library -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306 -I/Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306/utility /Users/flaki/Documents/Arduino/libraries/Adafruit_SSD1306/Adafruit_SSD1306.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit SSD1306/Adafruit_SSD1306.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -x assembler-with-cpp -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring_pulse.S -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_pulse.S.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/hooks.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/hooks.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/WInterrupts.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WInterrupts.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring_analog.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_analog.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring_digital.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_digital.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring_pulse.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_pulse.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -c -g -Os -w -ffunction-sections -fdata-sections -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/wiring_shift.c -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_shift.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/abi.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/abi.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/CDC.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/CDC.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HardwareSerial.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HardwareSerial0.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial0.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HardwareSerial1.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial1.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HardwareSerial2.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial2.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HardwareSerial3.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial3.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/HID.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HID.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/IPAddress.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/IPAddress.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/main.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/main.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/new.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/new.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/Print.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Print.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/Stream.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Stream.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/Tone.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Tone.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/USBCore.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/USBCore.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/WMath.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WMath.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-g++ -c -g -Os -w -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -MMD -mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=10605 -DARDUINO_AVR_MICRO -DARDUINO_ARCH_AVR -DUSB_VID=0x2341 -DUSB_PID=0x8037 -DUSB_MANUFACTURER="Unknown" -DUSB_PRODUCT="Arduino Micro" -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino -I/Applications/Arduino.app/Contents/Java/hardware/arduino/avr/variants/micro /Applications/Arduino.app/Contents/Java/hardware/arduino/avr/cores/arduino/WString.cpp -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WString.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_pulse.S.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/hooks.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WInterrupts.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_analog.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_digital.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_pulse.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/wiring_shift.c.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/abi.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/CDC.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial0.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial1.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial2.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HardwareSerial3.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/HID.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/IPAddress.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/main.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/new.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Print.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Stream.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Tone.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/USBCore.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WMath.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-ar rcs /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/WString.cpp.o
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-gcc -w -Os -Wl,--gc-sections -mmcu=atmega32u4 -o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.elf /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/SPI/SPI.cpp.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Wire/Wire.cpp.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Wire/utility/twi.c.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit GFX Library/glcdfont.c.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit GFX Library/Adafruit_GFX.cpp.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/Adafruit SSD1306/Adafruit_SSD1306.cpp.o /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/core.a -L/var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp -lm
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-objcopy -O ihex -j .eeprom --set-section-flags=.eeprom=alloc,load --no-change-warnings --change-section-lma .eeprom=0 /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.elf /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.eep
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avr-objcopy -O ihex -R .eeprom /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.elf /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex

Sketch uses 24,128 bytes (84%) of program storage space. Maximum is 28,672 bytes.
Global variables use 1,563 bytes (61%) of dynamic memory, leaving 997 bytes for local variables. Maximum is 2,560 bytes.
Forcing reset using 1200bps open/close on port /dev/cu.usbmodem1421
PORTS {/dev/cu.Bluetooth-Incoming-Port, /dev/cu.usbmodem1421, /dev/tty.Bluetooth-Incoming-Port, /dev/tty.usbmodem1421, } / {/dev/cu.Bluetooth-Incoming-Port, /dev/cu.usbmodem1421, /dev/tty.Bluetooth-Incoming-Port, /dev/tty.usbmodem1421, } => {}
PORTS {/dev/cu.Bluetooth-Incoming-Port, /dev/cu.usbmodem1421, /dev/tty.Bluetooth-Incoming-Port, /dev/tty.usbmodem1421, } / {/dev/cu.Bluetooth-Incoming-Port, /dev/tty.Bluetooth-Incoming-Port, } => {}
PORTS {/dev/cu.Bluetooth-Incoming-Port, /dev/tty.Bluetooth-Incoming-Port, } / {/dev/cu.Bluetooth-Incoming-Port, /dev/cu.usbmodem1421, /dev/tty.Bluetooth-Incoming-Port, /dev/tty.usbmodem1421, } => {/dev/cu.usbmodem1421, /dev/tty.usbmodem1421, }
Found upload port: /dev/cu.usbmodem1421
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/bin/avrdude -C/Applications/Arduino.app/Contents/Java/hardware/tools/avr/etc/avrdude.conf -v -patmega32u4 -cavr109 -P/dev/cu.usbmodem1421 -b57600 -D -Uflash:w:/var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex:i

avrdude: Version 6.0.1, compiled on Apr 14 2015 at 16:30:25
         Copyright (c) 2000-2005 Brian Dean, http://www.bdmicro.com/
         Copyright (c) 2007-2009 Joerg Wunsch

         System wide configuration file is "/Applications/Arduino.app/Contents/Java/hardware/tools/avr/etc/avrdude.conf"
         User configuration file is "/Users/flaki/.avrduderc"
         User configuration file does not exist or is not a regular file, skipping

         Using Port                    : /dev/cu.usbmodem1421
         Using Programmer              : avr109
         Overriding Baud Rate          : 57600
         AVR Part                      : ATmega32U4
         Chip Erase delay              : 9000 us
         PAGEL                         : PD7
         BS2                           : PA0
         RESET disposition             : dedicated
         RETRY pulse                   : SCK
         serial program mode           : yes
         parallel program mode         : yes
         Timeout                       : 200
         StabDelay                     : 100
         CmdexeDelay                   : 25
         SyncLoops                     : 32
         ByteDelay                     : 0
         PollIndex                     : 3
         PollValue                     : 0x53
         Memory Detail                 :

                                  Block Poll               Page                       Polled
           Memory Type Mode Delay Size  Indx Paged  Size   Size #Pages MinW  MaxW   ReadBack
           ----------- ---- ----- ----- ---- ------ ------ ---- ------ ----- ----- ---------
           eeprom        65    20     4    0 no       1024    4      0  9000  9000 0x00 0x00
           flash         65     6   128    0 yes     32768  128    256  4500  4500 0x00 0x00
           lfuse          0     0     0    0 no          1    0      0  9000  9000 0x00 0x00
           hfuse          0     0     0    0 no          1    0      0  9000  9000 0x00 0x00
           efuse          0     0     0    0 no          1    0      0  9000  9000 0x00 0x00
           lock           0     0     0    0 no          1    0      0  9000  9000 0x00 0x00
           calibration    0     0     0    0 no          1    0      0     0     0 0x00 0x00
           signature      0     0     0    0 no          3    0      0     0     0 0x00 0x00

         Programmer Type : butterfly
         Description     : Atmel AppNote AVR109 Boot Loader

Connecting to programmer: .
Found programmer: Id = "CATERIN"; type = S
    Software Version = 1.0; No Hardware Version given.
Programmer supports auto addr increment.
Programmer supports buffered memory access with buffersize=128 bytes.

Programmer supports the following devices:
    Device code: 0x44

avrdude: devcode selected: 0x44
avrdude: AVR device initialized and ready to accept instructions

Reading | ################################################## | 100% 0.00s

avrdude: Device signature = 0x1e9587
avrdude: reading input file "/var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex"
avrdude: writing flash (24128 bytes):

Writing | ################################################## | 100% 1.85s

avrdude: 24128 bytes of flash written
avrdude: verifying flash memory against /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex:
avrdude: load data flash data from input file /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex:
avrdude: input file /var/folders/lr/trms66qj3gl25fhl2f0qw7k00000gp/T/build6134344172974065422.tmp/ssd1306_128x64_spi.cpp.hex contains 24128 bytes
avrdude: reading on-chip flash data:

Reading | ################################################## | 100% 0.22s

avrdude: verifying ...
avrdude: 24128 bytes of flash verified

avrdude done.  Thank you.
```
