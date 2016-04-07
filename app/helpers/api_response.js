var errors = require('../../lib/errors')
var util = require('../../lib/util')

module.exports = function (err, data) {
  var response = {
    data: {},
    errors: {},
    meta: {
      'api_version': process.env.API_VERSION,
      'deprecation_information': {}
    }
  }
  if (err) {
    if (errors.important(err)) {
      var logUrl = `https://papertrailapp.com/systems/consumption-service-` +
                   `${process.env.NODE_ENV}/events?time=${util.secondsSinceEpoch()}`

    }

    response.errors = errors.resourceAndMessage(err)
  } else {
    response.data = data
  }
  return response
}
