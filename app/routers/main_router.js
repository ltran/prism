var Router = require('express').Router
var async = require('async')
var request = require('request')
var _ = require('underscore')
var url = require('url')
var centre = require('../services/centre')
var store = require('../services/store')
var category = require('../services/category')
var combineData = require('../helpers/centre_data_combiner')

var logger = require('../../lib/app_logger')
var router = new Router()

function logError (logId, err) {
  logger.error(logId, JSON.stringify(err))
}

function mainHandler (req, res) {
  var logId = req.headers['x-request-id']
  var centreId = req.params['centreId']
  var response = { healthy: true, message: 'success', centreId: centreId }
  var defaultApiKey = { 'api_key': process.env.WESTFIELD_API_KEY }

  function fetchCentresData (cb) {
    var centreOptions = { centreId: centreId, logId: logId }

    centre.get(centreOptions, cb)
  }

  function fetchStoresData (cb) {
    var storesOptions = { centreId: centreId, logId: logId }

    store.get(storesOptions, cb)
  }

  function fetchCategoriesData (categoryIds, cb) {
    async.map(categoryIds, function (categoryId, callback) {
      var categoryOptions = { categoryId: categoryId, logId: logId }
      category.get(categoryOptions, function (err, data) {
        return callback(err, data.name)
      })
    }, cb)
  }

  function fetchStoreCategoryData (cb, results) {
    var storeCategoryData = {}
    async.each(results.storesData, function (storeData, callback) {
      fetchCategoriesData(storeData.category_ids, function (err, data) {
        storeCategoryData[storeData.store_id] = data
        return callback(err)
      })
    }, function (err) {
      return cb(err, storeCategoryData)
    })
  }

  async.auto({
    centreData: fetchCentresData,
    storesData: fetchStoresData,
    categoriesData: ['storesData', fetchStoreCategoryData]
  }, function (err, results) {
    if (err)
      return res.json(err)

    var data = combineData(results)

    return res.json(data)
  })
}

router.get('/centres/:centreId', mainHandler)

module.exports = router
