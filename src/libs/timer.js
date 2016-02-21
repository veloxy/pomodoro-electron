var events = require('events');

function Timer() {
  var startDate = null;
  var interval = null;
  var intervalDelay = 100;

  var object = new events.EventEmitter;

  object.start = function() {
    startDate = new Date();
    interval = setInterval(object.update, intervalDelay);
    object.emit('start');
  }

  object.update = function() {
    var time = object.getCurrentTime();

    if (time.minutes >= 25) {
      object.stop();
      return;
    }

    object.emit('update', time);
  }

  object.stop = function() {
    clearInterval(interval);
    object.emit('stop');
  }

  object.getCurrentTime = function() {
    var timeDifference = new Date().getTime() - startDate.getTime();

    return {
      minutes: Math.floor(timeDifference / 60000),
      seconds: Math.floor((timeDifference % 60000) / 1000)
    };
  }

  return object;
}

module.exports = new Timer;