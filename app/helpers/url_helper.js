function setCacheControlHeader (disableCacheControl, res) {
  if (disableCacheControl || process.env.NODE_ENV === 'development') {
    return
  }

  res.setHeader('Cache-Control', 'max-age=3600, public, ' +
                'stale-while-revalidate=3600, stale-if-error=129600')
}

// Use the originalUrl so we get the actual url that the client uses.
// Middleware can modify any of the processed params so we can't be sure
// we will get the original url using params etc
// Formatting is done manually so we can avoid needing to parse the
// originalUrl
function requestUrl (req) {
  var host = req.headers['x-forwarded-host'] || req.headers.host
  var protocol = req.headers['x-forwarded-proto'] || req.protocol
  return `${protocol}://${host}${req.originalUrl}`
}

module.exports = {
  setCacheControlHeader: setCacheControlHeader,
  requestUrl: requestUrl
}
