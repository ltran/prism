var cluster = require('cluster')
var logger = require('./lib/app_logger')

var PORT = +process.env.PORT || 4000

var restartedIds = {}
function replaceWorker (workerToReplace) {
  if (restartedIds[workerToReplace.id] === undefined) {
    logger.info(`[Worker: ${workerToReplace.id}] Creating replacement`)
    restartedIds[workerToReplace.id] = cluster.fork()
  }
}

if (cluster.isMaster) {
  var os = require('os')
  var numWorkers = process.env.WEB_CONCURRENCY || os.cpus().length

  for (var i = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  cluster.on('disconnect', function (disconnectedWorker) {
    logger.info(`[Worker: ${disconnectedWorker.id}] Disconnected!`)
    replaceWorker(disconnectedWorker)
  })

  cluster.on('exit', function (killedWorker) {
    logger.info(`[Worker: ${killedWorker.id}] Exited!`)
    replaceWorker(killedWorker)
  })
} else {
  var domain = require('domain')
  var app = require('./app')
  var worker = cluster.worker

  var server = require('http').createServer(function (req, res) {
    var requestErrorDomain = domain.create()
    requestErrorDomain.on('error', function (domainError) {
      try {
        logger.error(
          `[Worker: ${worker.id}] Handling uncaught exception`, domainError.stack
        )

        // Shutdown the worker
        // `worker.suicide` will be set when `kill` or `disconnect` are called
        // So this ensures that we only shutdown the worker once
        if (!worker.suicide) {
          // Ensure the worker is terminated after waiting 30 seconds
          var killtimer = setTimeout(function () {
            logger.info(`[Worker: ${worker.id}] Terminating worker`)
            worker.kill()
          }, 30000)

          // This allows the worker to shut down before the 30 seconds is up
          killtimer.unref()

          // Trigger disconnect event in master and close server in worker
          // to prevent it accepting new requests
          worker.disconnect()
        }

        // Try and send an 'Internal Server Error' response
        res.sendStatus(500)
      } catch (criticalError) {
        // We can't handle this error so try to log it
        logger.error(
          `[Worker: ${worker.id}] Error sending 500!`, criticalError.stack
        )
      }
    })

    // `req` and `res` were created outside the domain so we need to explicitly
    // add them to the domain
    requestErrorDomain.add(req)
    requestErrorDomain.add(res)

    // Now run the handler function in the domain.
    requestErrorDomain.run(function () {
      app(req, res)
    })
  })

  // Start the server in the worker
  server.listen(PORT)
  server.on('listening', function () {
    logger.info(
      `[Worker: ${worker.id}] Server started on: http://localhost:${PORT}`
    )
  })
}
