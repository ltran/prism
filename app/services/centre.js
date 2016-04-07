var async = require('async')
var serviceApi = require('../helpers/service_api')
var redisClient = require('../helpers/redis_client')

exports.FIELDS_TO_RETRIEVE = ['centre_id', 'name']

module.exports.get = function (options, callback) {
  // don't bother sending multiple async requests if we're using
  // redis, since we can obtain multiple centre data with a single
  // redis command
  if (process.env.USE_REDIS === 'true') {
    return redisClient.getCentres({resourceName: 'centre',
                                   centreIds: options.centreIds,
                                   logId: options.logId}, callback)
  } else {
    // request data from centre service with each centreId in parallel, exit
    // immediately if an error occurs. On success, return an array of centre info
    async.map(options.centreIds, function (centreId, centreCallback) {
      var centreOptions = { fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
                            logId: options.logId, recordIdentifier: centreId,
                            resourceName: 'centre' }

      return serviceApi.serviceGet(centreOptions, centreCallback)
    }, callback)
  }
}

exports.processMessage = function (messageBody, messageId, callback) {
  var centreOptions = { fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
                        logId: messageId, requestUrl: messageBody.data.uri,
                        key: `${redisClient.PATHS.centre}:${messageBody.data.id}`,
                        resourceName: 'centre' }

  return redisClient.updateCache(centreOptions, serviceApi, callback)
}
