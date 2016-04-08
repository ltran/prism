var _ = require('underscore')
/* eslint-disable camelcase */

module.exports = function combineResults (results) {
  var returnedData = {
    data: [],
    includes: []
  }

  var categoriesData = results.categoriesData
  var centreData = results.centreData

  results.storesData.forEach(function (store) {
    returnedData.data.push(store)
  })

  _.each(categoriesData, function (item) {
    if (item.length > 0) {
      returnedData.includes.push({
        type: 'categories',
        category_id: item[0].id,
        name: item[0].name
      })
    }
  })

  returnedData.includes.push({
    type: 'centre',
    centre_id: centreData.centre_id,
    name: centreData.name
  })

  return returnedData
}
/* eslint-enable camelcase */
