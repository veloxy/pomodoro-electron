String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

const electron = require('electron');
const app = electron.app;
const menu = electron.Menu;
const tray = electron.Tray;
const browserWindow = require('electron').BrowserWindow;
const path = require('path');

var menuTray = null;
var window = null;

var timer = null;
var timerStart = null;

var menuItems = {
  'start': {
    label: 'Start',
    click: function() {
      timerStart = new Date();
      timer = setInterval(updateTimer, 1000)
      window.webContents.send('notification', 'Pomodoro', 'Timer started');
      menuTray.setContextMenu(menu.buildFromTemplate([menuItems.stop]));
    }
  },
  'stop': {
    label: 'Stop',
    click: function() {
      timerStart = new Date();
      clearInterval(timer);
      menuTray.setTitle('');
      window.webContents.send('notification', 'Pomodoro', 'Timer stopped');
      menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start]));
    }
  }
}

function updateTimer() {
  var diff = new Date().getTime() - timerStart.getTime();

  var minutes = Math.floor(diff / 60000);
  var seconds = Math.floor((diff % 60000) / 1000);

  menuTray.setTitle(' ' + minutes.toString().paddingLeft('00') + ':' + seconds.toString().paddingLeft('00'));

  if (minutes >= 25) {
    window.webContents.send('notification', 'Pomodoro', 'Break time!');
    clearInterval(timer);
    menuTray.setTitle('');
    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start]));
  }
}
app.dock.hide();
app.on('ready', function(){
  window = new browserWindow({ width: 1, height: 1, show: false, skipTaskbar: true });
  window.loadURL('file://' + __dirname + '/index.html');
  window.webContents.on('did-finish-load', function() {
    menuTray = new tray(path.join(__dirname, 'pomodoro-w.png'));
    menuTray.setTitle('');
    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start]));
  });
});