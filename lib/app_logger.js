var winston = require('winston')
var transports = require('./logger/transports')

module.exports = new winston.Logger({
  transports: transports.all
})

// need to set up custom labels before using them
var labels = { scheduler: 'Scheduler', notification: 'Notification', redis: 'Redis',
               mapping: 'Mapping', jsonvalidation: 'JSON Validation',
               product: 'Product', productimporter: 'Product Importer',
               productsyndicated: 'Product Syndicated', productqueue: 'Product Queue',
               productvalidation: 'Product Validation', s3: 'S3',
               sns: 'SNS', serviceapi: 'Service API', postgres: 'Postgres' }

Object.keys(labels).forEach(function (label) {
  winston.loggers.add(label, {
    // just to add a label, we need to create a new copy of
    // the transports. Wish there was a better way..
    transports: transports.init(labels[label])
  })
})

// prefix is responsible for prepending all log messages with the given label
module.exports.prefix = function (label) { return winston.loggers.get(label) }
