var env = require('./env')
var expressWinston = require('express-winston')

var transports = require('./logger/transports')

module.exports = {
  requestLogger: expressWinston.logger({
    // disable meta in development mode since it's too verbose
    transports: transports.all, meta: !env.isDevelopment()
  }),
  errorLogger: expressWinston.errorLogger({ transports: transports.all })
}
