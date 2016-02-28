# Clouduboy Flasher

An easy to use local-running app for your PC/Mac to make flashing your
Arduino/Arduboy device from [Clouduboy](http://cld.by/) a breeze, so you can
focus on creating great stuff!

For more info check out the [Clouduboy README](http://github.com/flaki/clouduboy/)!

## Troubleshooting

- **Fails at launch with `Can't find module: ... /serialport.node`**

This is caused by inconsitencies between `Electron` & `node-gyp`, as explained by
[Chris Williams](https://github.com/voodootikigod/node-serialport/issues/538#issuecomment-115207973).

You can work around it like
[this](https://github.com/voodootikigod/node-serialport/issues/538#issuecomment-162644623)
or if you are on OSX, you can try `npm run rebuild-serialport`.

- **Creating a DMG installer for OSX**

This should be automated in the future, but in the meantime, just use:

```
electron-packager app ClouduboyFlasher --platform=darwin --arch=x64 --version=0.36.9 --icon=build/Icon.icns --out=dist
cd dist/ClouduboyFlasher-*
cp ../../build/* .
appdmg -v dmg.json ../ClouduboyFlasher.dmg
cd ..
rm -rf ClouduboyFlasher-*
```
