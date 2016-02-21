# Basic Pomodoro in Electron

![App icon in OSX tray displaying time](screenshots/example.jpg "Pomodoro app screenshot")

This is a very very basic pomodoro app in electron. 

Code is subject to massive refactoring, this is mostly just a try-out project but I intend to expand on it and clean it up.

## Install (OSX)

Download the tar.gz [here](https://github.com/veloxy/pomodoro-electron/releases), extract it and drag the `.app` file it into your Applications folder.

## Build

### OS X

```
electron-packager ./ Pomodoro --platform=darwin --arch=all --version=0.36.7 --out=./build
```

## Credits

- Pomodoro icon by José Campos from the Noun Project
- Ratchet sound from [Freesound user atomota](http://www.freesound.org/people/atomota/)
- Bell sound from [Freesound user domrodrig](http://www.freesound.org/people/domrodrig/)
