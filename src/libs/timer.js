var events = require('events');

function Timer() {
  var currentDate = null;
  var endDate = null;
  var interval = null;
  var intervalDelay = 100;

  var object = new events.EventEmitter;

  object.start = function() {
    currentDate = new Date();
    endDate = new Date(currentDate.getTime() + (25 * 60 * 1000));

    interval = setInterval(function () { object.update("focus"); }, intervalDelay);
    object.emit('start');
  }

  object.shortBreak = function() {
    currentDate = new Date();
    endDate = new Date(currentDate.getTime() + (5 * 60 * 1000));

    interval = setInterval(function () { object.update("break"); }, intervalDelay);
    object.emit('shortBreak');
  }

  object.longBreak = function () {
    currentDate = new Date();
    endDate = new Date(currentDate.getTime() + (10 * 60 * 1000));

    interval = setInterval(function () { object.update("break"); }, intervalDelay);
    object.emit('longBreak');
  }

  object.update = function(mode) {
    var time = object.getCurrentTime();

    if (time.minutes <= 0) {
      if (time.seconds <= 0) {
        object.stop(false, mode);
        return;
      }
    }

    object.emit('update', { mode: mode, time: time });
  }

  object.stop = function(interrupt, mode) {
    if (interrupt === typeof 'undefined' || interrupt == null) {
      interrupt = true;
    }

    clearInterval(interval);
    object.emit('stop', { interrupt: interrupt, mode: mode });
  }

  object.getCurrentTime = function() {
    var timeDifference = endDate.getTime() - new Date().getTime();

    return {
      minutes: Math.floor(timeDifference / 60000),
      seconds: Math.floor((timeDifference % 60000) / 1000)
    };
  }

  return object;
}

module.exports = new Timer;
