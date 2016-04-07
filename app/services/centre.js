var async = require('async')
var serviceApi = require('../helpers/service_api')
var redisClient = require('../helpers/redis_client')

exports.FIELDS_TO_RETRIEVE = ['centre_id', 'name']

module.exports.get = function (options, callback) {
  var centreOptions = { fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
                        logId: options.logId, recordIdentifier: options.centreId,
                        resourceName: 'centre' }

  return serviceApi.serviceGet(centreOptions, callback)
}

exports.processMessage = function (messageBody, messageId, callback) {
  var centreOptions = { fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
                        logId: messageId, requestUrl: messageBody.data.uri,
                        key: `${redisClient.PATHS.centre}:${messageBody.data.id}`,
                        resourceName: 'centre' }

  return redisClient.updateCache(centreOptions, serviceApi, callback)
}
