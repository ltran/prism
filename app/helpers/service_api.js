var request = require('request')
var requestRetry = require('requestretry')
var url = require('url')
var redisClient = require('./redis_client')
var Boom = require('boom')
var _ = require('underscore')

var logger = require('../../lib/app_logger').prefix('serviceapi')

const THIRTY_SECONDS = 1000 * 30

function apiProtocol (parsedRequestUrl) {
  return parsedRequestUrl.protocol || (process.env.SSL_ENABLED === 'true' ? 'https' : 'http')
}

function apiUrl (resourceName) {
  var nodeEnv = process.env.NODE_ENV

  if (process.env.WESTFIELD_API_URL) {
    return process.env.WESTFIELD_API_URL
  }

  if (process.env.USE_HEROKU === 'true') {
    return `${resourceName === 'retailer' ? 'store' : resourceName}-service-${nodeEnv}.herokuapp.com`
  }

  if (nodeEnv === 'production') {
    return 'api.westfield.io'
  }

  return `api.${nodeEnv}.westfield.io`
}

function pathname (options, parsedRequestUrl) {
  var path = (parsedRequestUrl.pathname || `${options.resourceName}s/${options.recordIdentifier || ''}`)
  return `v1/${path}`
}

function host (options, parsedRequestUrl) {
  return parsedRequestUrl.host || apiUrl(options.resourceName)
}

function serviceUrl (options) {
  var fieldsToRetrieve = options.fieldsToRetrieve ? ({ fields: options.fieldsToRetrieve.join(',') }) : {}
  var parsedRequestUrl = url.parse(options.requestUrl || '')
  var defaultApiKey = { 'api_key': process.env.WESTFIELD_API_KEY }

  return url.format({ protocol: apiProtocol(parsedRequestUrl),
                      auth: parsedRequestUrl.auth,
                      host: host(options, parsedRequestUrl),
                      pathname: pathname(options, parsedRequestUrl),
                      query: _.extend(fieldsToRetrieve, defaultApiKey, options.query) })
}

function get (options, callback) {
  var requestUrl = serviceUrl(options)
  var logId = options.logId || ''

  // 30 second timeout to prevent connections from hanging
  var requestOptions = { url: requestUrl, json: true, timeout: THIRTY_SECONDS }
  var requestModule = request

  if (options.retry) {
    requestModule = requestRetry
    requestOptions.maxAttempts = options.maxAttempts || 5
    requestOptions.retryDelay = options.retryDelay || 5000
  }

  requestModule(requestOptions, function (error, response, body) {
    if (error) {
      logger.error(logId, `Error encountered while retrieving ${options.resourceName} data: ${error}`)
      return callback(Boom.wrap(error))
    } else {
      if (response.statusCode !== 200) {
        logger.debug(logId, `Failed to retrieve ${options.resourceName || ''}` +
              ` data with url '${requestUrl}'.  Status code: ${response.statusCode}. ` +
              ` Body: ${JSON.stringify(body)}`)
        var errorMessage = 'Associated resource not found'
        if (response.statusCode === 404) {
          return callback(Boom.notFound(errorMessage, { url: requestUrl }))
        } else {
          errorMessage = 'Failed to retrieve resource'
          return callback(Boom.create(response.statusCode, errorMessage, { url: requestUrl }))
        }
      }

      logger.debug(logId, `Successfully retrieved ${options.resourceName || ''} data from ${requestUrl}`)
      return callback(null, options.returnAllData ? body : body.data)
    }
  })
}

// options is an object that looks like the following:
//   { resourceName: 'store', disableService: true,
//     recordIdentifier: 'bondijunction', logId: 1234,
//     fieldsToRetrieve: ['name', 'store_id', '_links', 'centre_id'] }
function serviceGet (options, callback) {
  if (process.env.USE_REDIS === 'true') { return redisClient.redisGet(options, callback) }

  return get(options, callback)
}

module.exports = {
  get: get,
  serviceGet: serviceGet
}
