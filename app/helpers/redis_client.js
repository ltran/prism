var Boom = require('boom')
var logger = require('../../lib/app_logger').prefix('redis')
var redis = require('../../lib/redis_connection').sharedClient()

const SERVICE_CACHE_PREFIX = 'service_cache'
const STORES_SET_PATH = `${SERVICE_CACHE_PREFIX}:sets:stores`

const PATHS = {
  centre: `${SERVICE_CACHE_PREFIX}:centres`,
  store: `${SERVICE_CACHE_PREFIX}:stores`,
  retailer: `${SERVICE_CACHE_PREFIX}:retailers`
}

function validateKeys (options, keys) {
  if (!keys || keys.length === 0) {
    var errorMessage = `No data found`

    if (options.resourceName) {
      errorMessage = `No ${options.resourceName} data found`
    }

    if (options.query) {
      errorMessage = `${errorMessage} for retailer '${options.query.retailer_code}'`
    }

    return Boom.notFound(errorMessage, { important: true })
  }
}

function mget (options, keys, callback) {
  var keyValidationError = validateKeys(options, keys)

  if (keyValidationError) { return callback(keyValidationError) }

  redis.mget(keys, function (err, data) {
    if (err) {
      logger.error(options.logId, `Error encountered while retrieving data for keys ${keys}: ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully retrieved data for keys [${keys}]`)

    // mget returns an array of strings, we need to return an array
    // of JSON objects.  Filter out gaps in the array caused by
    // nonexistent data (some centres don't exist, causing null entries)
    return callback(null, JSON.parse(`[${data.filter(Boolean)}]`))
  })
}

function sadd (options, callback) {
  if (options.memberKey == null || options.memberKey.length === 0) { return callback() }

  redis.sadd(options.setKey, options.memberKey, function (err) {
    if (err) {
      logger.error(options.logId, `Error encountered while adding ` +
                   `member '${options.memberKey}' to set '${options.setKey}': ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully added ` +
                 `member '${options.memberKey}' to set '${options.setKey}'`)
    return callback()
  })
}

function srem (options, callback) {
  redis.srem(options.setKey, options.memberKey, function (err) {
    if (err) {
      logger.error(options.logId, `Error encountered while removing ` +
                   `member '${options.memberKey}' from set '${options.setKey}': ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully removed ` +
                 `member '${options.memberKey}' from set '${options.setKey}'`)
    return callback()
  })
}

function get (options, callback) {
  redis.get(options.key, function (err, data) {
    if (err) {
      logger.error(options.logId, `Error encountered while ` +
                                  `retrieving key '${options.key}': ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully retrieved data ` +
                                `for key '${options.key}'`)
    return callback(err, JSON.parse(data))
  })
}

function set (options, callback) {
  redis.set(options.key, JSON.stringify(options.value), function (err) {
    if (err) {
      logger.error(options.logId, `Error encountered while ` +
                   `setting data '${options.value}' for key '${options.key}': ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully set data ` +
                                `'${JSON.stringify(options.value, null, 2)}' for key '${options.key}'`)
    return callback()
  })
}

function getCentres (options, callback) {
  var keys = options.centreIds.map(function (centreId) { return `${PATHS.centre}:${centreId}`})

  return mget(options, keys, callback)
}

function updateStore (options, callback) {
  var retailerCode = options.value.retailer_code
  delete options.value.retailer_code

  var enabled = options.value.enabled
  delete options.value.enabled

  set({ key: options.key, value: options.value, logId: options.logId }, function (err) {
    if (err) { return callback(err) }

    if (enabled) {
      return sadd({setKey: `${STORES_SET_PATH}:${retailerCode}`,
                   memberKey: options.key, logId: options.logId}, callback)
    } else {
      return srem({setKey: `${STORES_SET_PATH}:${retailerCode}`,
                   memberKey: options.key, logId: options.logId}, callback)
    }
  })
}

function smembers (options, callback) {
  // retrieve all the member keys.  This will yield an array of keys
  // like ['stores:22278', 'stores:52444', 'stores:48456']
  redis.smembers(options.memberKey, function (err, keys) {
    if (err) {
      logger.error(options.logId, `Error encountered while retrieving ` +
                                  `member key ${options.memberKey}: ${err}`)
      return callback(err)
    }

    logger.debug(options.logId, `Successfully retrieved members for '${options.memberKey}'`)
    return callback(null, keys)
  })
}

function getStores (options, callback) {
  var memberKey = `${STORES_SET_PATH}:${options.query.retailer_code}`

  smembers({memberKey: memberKey, logId: options.logId}, function (err, keys) {
    if (err) {return callback(err) }

    return mget(options, keys, callback)
  })
}

function redisGet (options, callback) {
  // stores are grouped in redis as a set, with a member key of
  // 'service_cache:sets:stores:<retailer_code>'. This allows us to save the store
  // data separately, yet still give us the ability to retrieve all
  // the stores for a particular retailer at once
  if (options.resourceName === 'store') {
    return getStores(options, callback)
  } else {
    return get({ key: `${PATHS[options.resourceName]}:${options.recordIdentifier}`,
                 logId: options.logId }, callback)
  }
}

// updates the cache when a store, retailer or centre message is
// received.  We only handle update events, not deletions, since
// it's not currently possible to delete any of these objects.
// serviceApi module is passed as an argument, in order to prevent
// a circular dependency
function updateCache (options, serviceApi, callback) {
  serviceApi.get(options, function (err, data) {
    if (err) {
      return callback(err)
    }

    var redisOptions = { key: options.key, value: data, logId: options.logId }

    if (options.resourceName === 'store') {
      return updateStore(redisOptions, callback)
    } else {
      return set(redisOptions, callback)
    }
  })
}

module.exports = {
  SERVICE_CACHE_PREFIX: SERVICE_CACHE_PREFIX,
  STORES_SET_PATH: STORES_SET_PATH,
  PATHS: PATHS,
  redisGet: redisGet,
  getCentres: getCentres,
  updateCache: updateCache
}
