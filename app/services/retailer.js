var serviceApi = require('../helpers/service_api')
var redisClient = require('../helpers/redis_client')

exports.FIELDS_TO_RETRIEVE = [
  'retailer_code', 'name', 'country', 'affiliate_fields', 'features'
]

exports.get = function (options, callback) {
  var retailerOptions = {
    fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
    logId: options.logId, recordIdentifier: options.retailerCode,
    resourceName: 'retailer' }

  return serviceApi.serviceGet(retailerOptions, callback)
}

exports.processMessage = function (messageBody, messageId, callback) {
  var retailerOptions = {
    fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
    logId: messageId, requestUrl: messageBody.data.uri,
    key: `${redisClient.PATHS.retailer}:${messageBody.data.retailer_code}`,
    resourceName: 'retailer'
  }

  return redisClient.updateCache(retailerOptions, serviceApi, callback)
}
