const DEFAULT_MESSAGE = 'Unable to complete request'

function statusCode (err) {
  if (err.isBoom) {
    return err.output.statusCode
  }

  return err.statusCode || 500
}

function notFound (err) {
  return statusCode(err) === 404
}

function message (err) {
  if (err.data && err.data.message) {
    return err.data.message
  }

  if (err.data && err.data.private) {
    return DEFAULT_MESSAGE
  }

  // don't expose the detailed information for 500 errors
  if (statusCode(err) === 500) {
    return 'Internal Error'
  }

  return err.message
}

function resourceAndMessage (err) {
  var resourceName = 'base'
  var resourceAndMessageResult = {}

  if (err.data && err.data.resource !== undefined) {
    resourceName = err.data.resource
  }

  resourceAndMessageResult[resourceName] = [message(err)]

  return resourceAndMessageResult
}

function important (err) {
  return (err.data && err.data.important || statusCode(err) === 500)
}

module.exports = {
  statusCode: statusCode,
  message: message,
  important: important,
  notFound: notFound,
  resourceAndMessage: resourceAndMessage
}
