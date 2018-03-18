String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

const electron = require('electron'),
  app = electron.app,
  menu = electron.Menu,
  tray = electron.Tray,
  browserWindow = require('electron').BrowserWindow,
  notification = require('electron').Notification,
  dialog = require('electron').dialog,
  settings = require('electron-settings'),
  path = require('path'),
  slackWebClient = require('@slack/client').WebClient,
  timer = require('./libs/timer.js');

var menuTray = null,
  window = null,
  settingsWindow = null,
  slackWeb = null;

const inactiveMenu = menu.buildFromTemplate(
  [
    {
      label: 'Start',
      click: function() {
        timer.start();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Short break',
      click: function() {
        timer.shortBreak();
      }
    }, {
      label: 'Long break',
      click: function() {
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

app.dock.hide();

app.on('ready', function(){
  window = new browserWindow({ width: 1, height: 1, show: true, skipTaskbar: true });
  window.loadURL('file://' + __dirname + '/index.html');
  window.webContents.on('did-finish-load', init);
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

    // settingsWindow.webContents.openDevTools();

    settingsWindow.on('closed', function () {
      settingsWindow = null;
    });
  }
}

function slackError(error, msg) {
  dialog.showErrorBox(msg, error.message);
}

function setSlackFocus(minutes) {
  if (!settings.get('slack')) { return; }
  token = settings.get('slack_token');
  if (!token || token.length < 10) { return; }

  web = new slackWebClient(token);

  if (settings.get('slack_status')) {
    web.users.profile.set({
      profile: {
        status_emoji: settings.get('slack_status_emoji'),
        status_text: settings.get('slack_status_message')
      }
    }).then((res) => {
      console.log('Set slack status correctly');
      }).catch((err) => {
        slackError(err, "Couldn't set Slack status");
      });
  }

  if (settings.get('slack_do_not_disturb')) {
    web.dnd.setSnooze({ num_minutes: minutes })
      .then((res) => {
        console.log(`Set do not disturb for ${minutes} minutes`, res.ts);
      })
      .catch((err) => {
        slackError(err, "Couldn't set Do Not Disturb mode");
      });
  }
}

function removeSlackFocus() {
  if (!settings.get('slack')) { return; }
  token = settings.get('slack_token');
  if (!token || token.length < 10) { return; }

  web = new slackWebClient(token);

  if (settings.get('slack_status')) {
    web.users.profile.set({ profile: { status_emoji: '', status_text: '' } })
      .then((res) => {
        console.log('Cleared the slack status');
      })
      .catch((err) => {
        slackError(err, "Couldn't clear Slack status");
      });
  }

  if (settings.get('slack_do_not_disturb')) {
    web.dnd.endDnd().then((res) => {
      console.log('Turned off slack do not disturbe mode');
    })
    .catch((err) => {
      slackError(err, "Couldn't turn off Do Not Disturb mode");
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

    if (obj && !obj.interrupt) {
      if (obj.mode == 'break') {
        notificationTitle = '💻 Time to work!';
        notificationMessage = 'Start a new pomodoro to get some more things done.';
      } else {
        notificationTitle = '🗣 Get up an talk!';
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
      removeSlackFocus();
    }
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
