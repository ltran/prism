module.exports = function filterFields (rawFields) {
  var fields
  if (rawFields) {
    fields = rawFields.split(',').map(function (field) {
      return field.trim()
    })
  }
  return fields
}
