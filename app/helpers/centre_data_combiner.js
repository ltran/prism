var _ = require('underscore')
/* eslint-disable camelcase */

module.exports = function combineResults (includes, results) {
  var includes = includes.split(",")

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

  if (includes.indexOf('category') >= 0) {
    returnedData.includes.push(
      _.map(categories, function(val, key) {
        return { type: 'category', category_id: key, name: val }
      })
    )
  }

  if (includes.indexOf('centre') >= 0) {
    returnedData.includes.push({
      type: 'centre',
      centre_id: centreData.centre_id,
      name: centreData.name
    })
  }

  return returnedData
}
/* eslint-enable camelcase */
