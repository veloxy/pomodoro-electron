
const electron = require('electron'),
  app = electron.app,
  menu = electron.Menu,
  tray = electron.Tray,
  browserWindow = require('electron').BrowserWindow,
  path = require('path'),
  timer = require('./libs/timer.js');

//for Windows's Setup
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

var currentMinute = null;

var menuTray = null,
  window = null,
  menuItems = {
    'start': {
      label: 'Start',
      click: function() {
        timer.start();
      }
    },
    'stop': {
      label: 'Stop',
      click: function () {
        timer.stop();
      },
    },
    'quit': {
      label: 'Quit Application',
      click: function () {
        app.quit();
      }
    }
  };
String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

app.on('ready', function(){
  window = new browserWindow({ width: 1, height: 1, show: false, skipTaskbar: true });
  window.loadURL('file://' + __dirname + '/index.html');
  window.webContents.on('did-finish-load', init);
});

function init() {
  menuTray = new tray(path.join(__dirname, 'assets/img/pomodoroTemplate.png'));
  menuTray.setTitle('');
  menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start, menuItems.quit]));

  timer.on('start', function() {
    currentMinute = 24;
    window.webContents.send('play-sound', path.join(__dirname, 'assets/sound/windup.mp3'));
    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.stop, menuItems.quit]));
  });

  timer.on('stop', function(interrupted) {
    menuTray.setTitle('');

    if (!interrupted) {
      window.webContents.send('notification', {
        title: 'Time\'s up!',
        body: 'Time for a short break',
        sound: path.join(__dirname, 'assets/sound/bell.mp3') });
    }

    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start, menuItems.quit]));
  });

  timer.on('update', function(data) {
    let time = ' ' + data.minutes.toString().paddingLeft('00') +
    ':' + data.seconds.toString().paddingLeft('00');
    menuTray.setToolTip(time);
    menuTray.setTitle(time);
  });
}
//for generate windows setup , update and remove windows's application
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};
