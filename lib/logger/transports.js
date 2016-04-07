var winston = require('winston')
var path = require('path')
var fs = require('fs')
var env = require('../env')
var util = require('../util')

function init (label) {
  var transports = []

  if (!env.isTest()) {
    transports.push(
      new winston.transports.Console(
        {
          label: label,
          colorize: true,
          handleExceptions: false,
          level: env.isDevelopment() ? 'debug' : env.fetch('LOG_LEVEL', 'info'),
          // use local time in dev mode. If we simply pass true, it returns GMT
          timestamp: env.isDevelopment() || env.fetch('TIMESTAMP') ? util.currentTime : false
        }
      )
    )
  }

  // Use file transport when developing locally
  if (env.is('development', 'test')) {
    var logDirPath = path.join(process.cwd(), 'log')
    var logFilePath = path.join(logDirPath, env.current() + '.log')
    if (!fs.existsSync(logDirPath)) {
      fs.mkdirSync(logDirPath)
    }
    transports.push(
      new winston.transports.File(
        { filename: logFilePath, json: false, level: 'debug', label: label,
          timestamp: util.currentTime }
      )
    )
  }

  return transports
}

module.exports = { all: init(), init: init }
