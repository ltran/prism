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

  var categories = {}
  _.each(categoriesData, function (category) {
    if (category.length > 0) {
      category.forEach(function (cat) {
        categories[cat.id] = cat.name
      })
    }
  })

  returnedData.includes.push(
    _.map(categories, function(val, key) {
      return { type: 'category', category_id: key, name: val }
    })
  )

  returnedData.includes.push({
    type: 'centre',
    centre_id: centreData.centre_id,
    name: centreData.name
  })

  return returnedData
}
/* eslint-enable camelcase */
