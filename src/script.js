String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

const electron = require('electron'),
  app = electron.app,
  menu = electron.Menu,
  tray = electron.Tray,
  browserWindow = require('electron').BrowserWindow,
  dialog = require('electron').dialog,
  settings = require('electron-settings'),
  path = require('path'),
  slackWebClient = require('@slack/client').WebClient,
  timer = require('./libs/timer.js');

let menuTray = null,
  window = null,
  settingsWindow = null,
  slackNonFocusStatus = { profile: { status_emoji: '', status_text: '' } };

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const inactiveMenu = menu.buildFromTemplate(
  [
    {
      label: 'Start',
      click: function() {
        saveCurrentSlackStatus();
        timer.start();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Short break',
      click: function() {
        saveCurrentSlackStatus();
        timer.shortBreak();
      }
    }, {
      label: 'Long break',
      click: function() {
        saveCurrentSlackStatus();
        timer.longBreak();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Settings',
      click: function () {
        showSettings();
      },
    }, {
      label: 'Quit Application',
      click: function() {
        app.quit();
      }
    }
  ]
)

const activeMenu = menu.buildFromTemplate(
  [
    {
      label: 'Stop',
      click: function() {
        timer.stop();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Settings',
      click: function () {
        showSettings();
      },
    }, {
      label: 'Quit Application',
      click: function() {
        app.quit();
      }
    }
  ]
)

const appTemplate = [{
  label: "Application",
  submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]}, {
  label: "Edit",
  submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]}
];

app.dock.hide();

app.on('ready', function(){
  window = new browserWindow({ width: 1, height: 1, show: true, skipTaskbar: true });
  window.loadURL('file://' + __dirname + '/index.html');
  window.webContents.on('did-finish-load', init);
  menu.setApplicationMenu(menu.buildFromTemplate(appTemplate));
});

function showSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
  } else {
    settingsWindow = new browserWindow({
      width: 700,
      height: 600,
      minWidth: 700,
      minHeight: 600,
      useContentSize: true,
      acceptFirstMouse: true,
      backgroundColor: '#fff',
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      center: true
    });
    settingsWindow.loadURL('file://' + __dirname + '/settings.html');

    settingsWindow.on('closed', function () {
      settingsWindow = null;
    });
  }
}

function slackError(error, msg) {
  dialog.showErrorBox(msg, error.message);
}

function getSlackClient() {
  if (!settings.get('slack')) { return null; }
  let token = settings.get('slack_token');
  if (!token || token.length < 10) { return null; }
  return new slackWebClient(token);
}

function saveCurrentSlackStatus() {
  const slackClient = getSlackClient();
  if (slackClient) {
    slackClient.users.profile.get()
      .then((res) => {
        const { status_emoji, status_text } = res.profile;
        slackNonFocusStatus = {profile: { status_emoji, status_text } };
      })
      .catch((err) => {
        const errorMsg = 'Failed to fetch user profile. ' +
                        'If you had a slack status set, it will not be restored ' +
                        'when the current pomodoro will end.'
        slackError(err, errorMsg);
        console.log(error);
      });
  }
}

function setSlackFocus(minutes) {
  const slackClient = getSlackClient();
  if (slackClient && settings.get('slack_status')) {
    slackClient.users.profile.set({
      profile: {
        status_emoji: settings.get('slack_status_emoji'),
        status_text: settings.get('slack_status_message')
      }
    }).then((res) => {
      console.log('Set slack status correctly');
      }).catch((err) => {
        slackError(err, "Couldn't set Slack status");
        console.error(err);
      });
  }

  if (slackClient && settings.get('slack_do_not_disturb')) {
    slackClient.dnd.setSnooze({ num_minutes: minutes })
      .then((res) => {
        console.log(`Set do not disturb for ${minutes} minutes`);
      })
      .catch((err) => {
        slackError(err, "Couldn't set Do Not Disturb mode");
        console.error(err);
      });
  }
}

function removeSlackFocus() {
  const slackClient = getSlackClient();
  if (slackClient && settings.get('slack_status')) {
    slackClient.users.profile.set(slackNonFocusStatus)
      .then((res) => {
        console.log('Cleared the slack status');
      })
      .catch((err) => {
        slackError(err, "Couldn't clear Slack status");
        console.error(err);
      });
  }

  if (slackClient && settings.get('slack_do_not_disturb')) {
    slackClient.dnd.endDnd().then((res) => {
      console.log('Turned off slack do not disturbe mode');
    })
    .catch((err) => {
      slackError(err, "Couldn't turn off Do Not Disturb mode");
      console.error(err);
    });
  }
}

function init() {
  menuTray = new tray(path.join(__dirname, 'assets/img/pomodoroTemplate.png'));
  menuTray.setTitle('');
  menuTray.setContextMenu(inactiveMenu);

  timer.on('start', function() {
    window.webContents.send('play-sound', path.join(__dirname, 'assets/sound/windup.mp3'));
    menuTray.setContextMenu(activeMenu);
    setSlackFocus(25);
  });

  timer.on('shortBreak', function () {
    window.webContents.send('play-sound', path.join(__dirname, 'assets/sound/windup.mp3'));
    menuTray.setContextMenu(activeMenu);
  });

  timer.on('longBreak', function () {
    window.webContents.send('play-sound', path.join(__dirname, 'assets/sound/windup.mp3'));
    menuTray.setContextMenu(activeMenu);
  });

  timer.on('stop', function(obj) {
    menuTray.setTitle('');

    let notificationTitle,
      notificationMessage;

    if (obj && !obj.interrupt) {
      if (obj.mode == 'break') {
        notificationTitle = '💻 Time to work!';
        notificationMessage = 'Start a new pomodoro to get some more things done.';
      } else {
        notificationTitle = '🗣 Get up and talk!';
        notificationMessage = 'Use this break to disconnect from ' +
                              'what you just did. Get up, go for a walk, talk to others.';
      }

      window.webContents.send('notification', {
        title: notificationTitle,
        body: notificationMessage,
        sound: path.join(__dirname, 'assets/sound/bell.mp3'),
        sticky: true
      });
    }

    menuTray.setContextMenu(inactiveMenu);

    if (obj.mode == 'focus') {
      timer.shortBreak();
    }

    removeSlackFocus();
  });

  timer.on('update', function(data) {
    if (data.mode == 'break') {
      menuTray.setTitle(
        ' 🗣 ' + data.time.minutes.toString().paddingLeft('00') +
        ':' + data.time.seconds.toString().paddingLeft('00')
      );
    } else {
      menuTray.setTitle(
        ' ' + data.time.minutes.toString().paddingLeft('00') +
        ':' + data.time.seconds.toString().paddingLeft('00')
      );
    }
  });
}
