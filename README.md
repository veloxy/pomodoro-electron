# Pomodoro App in Electron

Basic Pomodoro App in Electron with (optional) Slack integration.

![App icon in OSX](https://srcbx.be/bLv?direct)

Feature list:

* Start/stop the timer
* Rings a bell and displays a notification when your 25 minutes are over
* Displays the time in the menu bar when timer is started
* Supports breaks (5min and 10min)
* Turns on the Do Not Disturb mode on Slack while timer runs
* Sets custom Slack status with emoji while running

Currently only available on OS X, PR's are welcome!

## Installation

[Download latest release](https://github.com/veloxy/pomodoro-electron/releases) and install it like any other OSX application. 😋

## Building from source

```
yarn install
yarn build
```

## Credits

- Pomodoro icon by José Campos from the Noun Project
- Ratchet sound from [Freesound user atomota](http://www.freesound.org/people/atomota/)
- Bell sound from [Freesound user domrodrig](http://www.freesound.org/people/domrodrig/)
