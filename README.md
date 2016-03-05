# Clouduboy

![Clouduboy Intro](/editor/res/clouduboy-intro.gif)

Clouduboy is a connected Arduino cloud editor & MMDACCI. Nope, that's not latin for the release date - it means _Massively Multi-Device Arduboy Cloud-Compiler & IDE_. Whoah, that's quite a mouthful! But it really **means** that "connected" part, though! See, there are a _lot_ of IDE-s and Code Editors and cloud-based Arduino-workbenches out there.  
Clouduboy specifically focuses on making Arduino hacking truly _fun_, working with the device/browser of your choice and even if you only have very basic coding skills.

## Using the service
_Just open up your favorite web browser, and go to http://clouduboy.slsw.hu/ !_

It should definitely work in Firefox & Chrome, but all other pretty recent browsers should be supported as we chip away on some of the nasty bugs in cross-browser land. On mobiles and tablets, Chrome & Firefox for Android should definitely work, and Safari support is coming along nicely.  
Cross-browser support is a tough nut to crack, but feel free to jump in, any help is greatly appreciated!

### Sessions
The first time you open up the site, you will be greeted with the startup screen. You can start a new session here, or type your magic wordkey to join an existing session. Yes, you heard that right, sessions are operated via _magical word-triplet-wizardry_! ✨  
QR codes are cumbersome, and NFC is not very prevalent on the web, so that leaves word codes - but hey, it is also much more fun to type _"Wondrous Unicorn Fluff"_ than some random garblewords. I dare you to try! 😉

_(Also, I have my imaginary battery of horses with me, and they, too agree that my assumption of magical word-triplets being the [staple](https://www.xkcd.com/936/) of the product is indeed correct...)_

### The Flasher
You can also download the pre-packaged Flasher on the start page. The Flasher is a cross-platform [Electron](https://github.com/atom/electron) app to flash your games & creations, also written in JavaScript. Once started, like a mystical genie, the Flasher sits idly in your taskbar/tray _(in the form of an Arduboy-icon)_, waiting for your commands.  
The app connects to the Clouduboy server and lets you flash your games onto the Arduboy with a single click on the "lightning" icon in the Clouduboy menubar. It's that simple!

Upon startup, or if you initiate a new session you will also need to provide your magical word-triplet to the Flasher so it can establish a connection to your session.

### Service Notes
Note, that this is'nt some big commercial app, floating on millions of dollars of VC-funding.※ This implies that bugs are only fixed once someone has a bit of a spare time to [hack on them](https://twitter.com/t_grote/status/698256793919692800). This also implies, that the service runs on a dirt-cheap, tiny DigitalOcean droplet, and since it also has to _compile_ sketches, it **will** be slow.  
Please be kind — and if something breaks, file an [issue](https://github.com/flaki/clouduboy/issues).

_※ although, feel free to send any number of million dollars to here:_ [![Support](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](http://cld.by/support) 😋


## More on Clouduboy
Clouduboy helps you get the most out of your [Arduboy](http://arduboy.com/), or [Hackduboy](http://community.arduboy.com/t/12-arduboy-compatible-system/236/) by providing an easily accessible & cross-platform IDE (development environment) with clear-cut examples to make & remix your Very Own Arduboy games. Don't worry, even if you never programmed in C before — the Arduboy library is rather straightforward to get you started in no time, building your own games with pretty pixelgraphics, buzzy music & tons of fun!

Not even that, but Clouduboy takes "connectedness" pretty seriously. How so? Well, like I said, games are great - they tingle, buzz, have flashy graphics and stuff. Normally, to make the Arduino's tiny chip understand all that, you have to descend to the depths of binary codes and bits & bytes, all that nasty stuff that chips & computers are _really_ good at. Humans? Well, they... not so much.

Here comes Clouduboy's connectedness to the rescue, and the power of browsers & HTML5! The IDE includes a series of _"editor extensions"_, that make creating and reading all that encoded data a breeze: built-in editor for sprites, even for polyphonic music! And the best thing? You don't have to wrestle your notebook's touchpad to wrangle those pixels: as this is just the "web", all that stuff is running in a browser! You could whip up your favorite phone or tablet, open Clouduboy in a browser, say your [magic words](#sessions), et voilá, you can now use your _fingers_ to draw and edit your sprites! Much easier, right?  
The same goes for music: just grab your tablet, tap on an audio node, and play something nice! If you can play the piano, even better — with a proper tablet you get multitouch-polyphony and real multi-channel creation, while Clouduboy does the heavy-lifting for you and records & converts your on-the-spot symphony into bits and blobs. 😉

Clouduboy is also pretty much a living testament to [JavaScript taking over the world](https://medium.com/@slsoftworks/javascript-world-domination-af9ca2ee5070) - there aren't very many parts of it requiring any more than the knowledge of JavaScript & HTML5 (and even for those pesky parts, [I have a few ideas mwahahaaa!](how-to-make-this-even-more-awesome)).

The app is pure, browser-based JS & HTML5, the flasher itself is nothing more than a node.js/electron app using `node-serialport` (but maybe we won't even need that for long, if WebUSB/WebSerial takes over soon). All-in-all, if you are a JavaScript hacker, Clouduboy lets you dive a bit deeper into the soul of the system via Arduino, and lets you polish your webby skills as well, if you decided to contribute.

You will still need an internet connection (albeit, a not very swift one will do), and a computer if you want to flash sketches, but even those are requirements, that are (hopefully) going away (soon)... 😏

## Compatible devices

Clouduboy is compatible with the Arduboy DevKit, production Arduboys, and any _"Hackduboy"_-s you build, as an Arduboy is really just an [ATmega32U4](http://www.atmel.com/devices/ATMEGA32U4.aspx) (which is essentially an Arduino Leonardo/Micro), hooked up to some buttons, a screen and a piezo buzzer.

## Hosting your own Clouduboy

## How to make this even more awesome?
Clouduboy is still young, and, well, pretty much a _hack_. I have a lot in terms of ways it can be improved, and I bet you do, too. Here are some the things on my TODO-list, from the top of my head to get you started:

- Real-time collaborative editing
- Arduboy.js sketch runner/emulator
- HTML5-to-Arduboy cross-compilation
- Extend support for all 32u4-based Arduinos
- ...and later to different Arduinos as well
- Offline support ([service workers](https://github.com/slightlyoff/ServiceWorker/))
- _Real_ offline support (JavaScript sketch compiler)
- Host-your-own-Clouduboy-Tesselization (host this on a [Tessel 2](http://tessel.io/))
- $5 true disconnectedness (Raspberry Pi Zero host+flasher)

That's a lot of ideas (and work) in there, right? So feel free to help out!
Jump into the [issues](https://github.com/flaki/clouduboy/issues) and happy hacking!

## Open Source at ♥
Without all these awesome free/open source projects & the lovely people putting countless hours of work and love into making & maintaining them , Clouduboy wouldn't be where it is _(heck, I'd say it wouldn't even **be**...)_.

I thank, from the bottom of my heart to all these lovely open-sourcerers — and y'all should, too! 💖

- [Arduboy](https://github.com/Arduboy/Arduboy) by @Arduboy
- [Codemirror](http://codemirror.net/) by @marjinh
- [node-serialport](https://github.com/voodootikigod/node-serialport/) by @voodootikigod
- [AVRGIRL](https://github.com/noopkat/avrgirl-arduino) by @noopkat
- [Platform IO](https://github.com/platformio/platformio/) by @platformio
- [Electron](https://github.com/atom/electron) by @atom

## Contributing:
* You are helping even if you just file the issues
* Also, feel free to help fixing them — have a look at the issues
* You can [support](#service-notes) development & hosting
* Please, be nice to maintainers, contributors, each other.
* For details, check [CONTRIBUTING.md](CONTRIBUTING.md).

## License
* Clouduboy is free software licensed under MIT license - see [LICENSE.md](LICENSE.md) for details.
