var env = require('../lib/env')
env.ensureValid()
var express = require('express')
var compress = require('compression')
var path = require('path')

var app = express()
var mainRouter = require('./routers/main_router')
var httpLogger = require('../lib/http_logger')
var passport = require('passport')
var herokuLockdown = require('../lib/heroku_lockdown')

app.disable('x-powered-by')

if (env.is('development', 'test')) {
  app.use(require('../lib/middleware/request_id'))
}

app.use(compress())
app.use(httpLogger.requestLogger)
app.use(express.static(path.join(__dirname, '../public')))

app.use(mainRouter)

app.use(httpLogger.errorLogger)

module.exports = app
