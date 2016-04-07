var logger = require('./app_logger').prefix('redis')
var url = require('url')

var redisUrl = url.parse(
  process.env.REDISCLOUD_URL || process.env.REDISTOGO_URL || 'redis://localhost:@127.0.0.1:6379'
)

var port = redisUrl.port
var host = redisUrl.hostname
var auth = redisUrl.auth.split(':')[1]

function createClient () {
  var redisConnection

  redisConnection = require('redis').createClient(port, host)
  if (auth) { redisConnection.auth(auth) }

  if (process.env.LOG_LEVEL === 'debug') {
    redisConnection.on('connect', function () {
      redisConnection.info(function (err, info) {
        if (err) {
          logger.debug('Error encountered while retrieving info:', err)
          return
        }
        var numberOfClients = info ? info.match(/connected_clients:(\d*)/)[1] : info
        logger.debug('connected. Number of clients:', numberOfClients)
      })
    })
  }

  // if we don't register a listener for the error event,
  // the node server will quit when encountering a redis error
  redisConnection.on('error', function (err) {
    logger.error('Error encountered from redis', err)
  })

  return redisConnection
}

var sharedClientInstance

function sharedClient () {
  if (!sharedClientInstance) {
    sharedClientInstance = createClient()
  }
  return sharedClientInstance
}

module.exports = {
  sharedClient: sharedClient,
  auth: auth,
  port: port,
  host: host
}
