var serviceApi = require('../helpers/service_api')
var redisClient = require('../helpers/redis_client')

exports.FIELDS_TO_RETRIEVE = ['name', 'store_id', 'category_ids', 'centre_id']

exports.get = function (options, callback) {
  var storeOptions = {
    fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
    logId: options.logId, query: { 'centre_id': options.centreId },
    resourceName: 'store'
  }

  return serviceApi.serviceGet(storeOptions, callback)
}

exports.processMessage = function (messageBody, messageId, callback) {
  var storeOptions = {
    fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE.concat(['retailer_code', 'enabled']),
    logId: messageId, requestUrl: messageBody.data.uri,
    key: `${redisClient.PATHS.store}:${messageBody.data.id}`,
    resourceName: 'store' }

  return redisClient.updateCache(storeOptions, serviceApi, callback)
}
