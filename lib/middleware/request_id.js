var requestNumber = 0
module.exports = function (req, res, next) {
  requestNumber += 1
  req.headers['x-request-id'] = 'request-id-' + requestNumber
  next()
}
