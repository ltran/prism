function secondsSinceEpoch () {
  return Math.floor(Date.now() / 1000)
}

function dec2hex (number, padding) {
  return (number + 0x10000).toString(16).substr(-padding)
}

function elapsedSeconds (start) {
  return Math.round((new Date() - start) / 1000)
}

function elapsedMinutes (start) {
  return Math.floor(elapsedSeconds(start) / 60)
}

function elapsedTimeInWords (start) {
  var numSeconds = elapsedSeconds(start)

  if (numSeconds >= 60) {
    return `${elapsedMinutes(start)} minutes`
  }

  return `${numSeconds} seconds`
}

// high resolution timer
var elapsedTimeHR = function (start) {
  var precision = 3 // 3 decimal places
  var elapsed = process.hrtime(start)[1] / 1000000 // divide by a million to get nano to milli

  return elapsed.toFixed(precision) + 'ms'
}

// taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
function currentTime () {
  var now = new Date()

  function pad (number) {
    if (number < 10) {
      return '0' + number
    }
    return number
  }

  return now.getFullYear() +
    '-' + pad(now.getMonth() + 1) +
    '-' + pad(now.getDate()) +
    'T' + pad(now.getHours()) +
    ':' + pad(now.getMinutes()) +
    ':' + pad(now.getSeconds()) +
    '.' + (now.getMilliseconds() / 1000).toFixed(3).slice(2, 5)
}

module.exports = {
  secondsSinceEpoch: secondsSinceEpoch,
  dec2hex: dec2hex,
  currentTime: currentTime,
  elapsedSeconds: elapsedSeconds,
  elapsedMinutes: elapsedMinutes,
  elapsedTimeInWords: elapsedTimeInWords,
  elapsedTimeHR: elapsedTimeHR
}
