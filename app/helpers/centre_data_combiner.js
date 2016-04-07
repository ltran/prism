/* eslint-disable camelcase */

module.exports = function combineResults (results) {
  var returnedData = []
  var categoriesData = results.categoriesData
  var centresData = results.centresData

  results.storesData.forEach(function(store) {
    store.centre = centresData[0]['name']
    store.categories = categoriesData[store.store_id]
    returnedData.push(store)
  })

  return returnedData
}
/* eslint-enable camelcase */
