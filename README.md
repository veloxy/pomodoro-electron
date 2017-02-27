# Pomodoro App in Electron

![App icon in OSX tray displaying time](https://goo.gl/yOrILm "Pomodoro app screenshot")

This is a very simple pomodoro app in electron. It doesn't have any fancy features, just does what it's supposed to!

This is all it does:

* Start/stop the timer
* Rings a bell and displays a notification when your 20 minutes are over
* Displays the time in the menu bar on OS X when timer is started

Available on OS X, Linux, Windows.

## Installation

[Download latest release](https://github.com/veloxy/pomodoro-electron/releases) and install it like any other OSX application. 😋

## Building from source

#### Mac OS
```
yarn
yarn release-mac
```

#### Windows
```
yarn --ignore-platform
yarn release-win
```

#### Linux
```
yarn --ignore-platform
yarn pack-linux
```

Of course, we can use npm instead of Yarn.

## Credits

- Pomodoro icon by José Campos from the Noun Project
- Ratchet sound from [Freesound user atomota](http://www.freesound.org/people/atomota/)
- Bell sound from [Freesound user domrodrig](http://www.freesound.org/people/domrodrig/)

