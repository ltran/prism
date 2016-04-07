require('dotenv').load()
var logger = require('./lib/app_logger')
var Monitor = require('forever-monitor').Monitor

// it's necessary to use forever-monitor to keep this process running,
// otherwise heroku will wait 10 minutes before restarting the process
// https://devcenter.heroku.com/articles/dynos#dyno-crash-restart-policy
var child = new Monitor(process.argv[2], {
  watch: process.env.NODE_ENV === 'development',
  watchIgnorePatterns: ['*.log', 'coverage/**', '.git/**', 'log/**',
                        'tmp/**', 'scripts/**', 'node_modules/**'],
  watchDirectory: './',
  args: ['--color']
})

child.on('watch:restart', function (info) {
  logger.info(`[Forever] Restarting script because file '${info.stat}' received '${info.file}' event`)
})

child.on('restart', function () {
  logger.info('[Forever] Restarting script')
})

child.start()
