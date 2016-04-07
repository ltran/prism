function contains (element, array) {
  return array.indexOf(element) >= 0
}
function capitaliseFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function isEnv (env) {
  return function () {
    return process.env.NODE_ENV === env
  }
}

var environments = ['development', 'test', 'uat', 'production']

var helpers = {
  fetch: function fetch (envVariable, defaultValue) {
    return process.env[envVariable] || defaultValue
  },
  fetchInt: function fetchInt (envVariable, defaultValue) {
    return parseInt(module.exports.fetch(envVariable, defaultValue), 10)
  },
  ensureValid: function ensureValid () {
    var currentEnv = process.env.NODE_ENV
    if (!contains(currentEnv, environments)) {
      throw new Error(
        'NODE_ENV was ' + currentEnv + ' expected one of ' + environments
      )
    }
  },
  /**
    Checks if any of the environments passed in match the current environment
  */
  is: function is () {
    return Array.prototype.some.call(arguments, function (arg) {
      return isEnv(arg)()
    })
  },
  current: function current () {
    return process.env.NODE_ENV
  }
}

environments.forEach(function (env) {
  helpers['is' + capitaliseFirstLetter(env)] = isEnv(env)
})

module.exports = helpers
