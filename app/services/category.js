var serviceApi = require('../helpers/service_api')
var redisClient = require('../helpers/redis_client')

exports.FIELDS_TO_RETRIEVE = ['name', 'category_id']

exports.get = function (options, callback) {
  var categoryOptions = {
    fieldsToRetrieve: exports.FIELDS_TO_RETRIEVE,
    logId: options.logId,
    requestUrl: `categories/${options.categoryId}/locales/en_AU`,
    resourceName: 'category'
  }

  return serviceApi.serviceGet(categoryOptions, callback)
}
