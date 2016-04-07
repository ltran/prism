/* eslint-disable camelcase */

module.exports = function combineResults (results) {
  var returnedData = []
  var categoriesData = results.categoriesData
  var centreData = results.centreData

  results.storesData.forEach(function(store) {
    store.centre = centreData.name
    store.categories = categoriesData[store.store_id]
    returnedData.push(store)
  })

  return returnedData
}
/* eslint-enable camelcase */
