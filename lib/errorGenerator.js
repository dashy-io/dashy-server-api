'use strict';

function create(statusCode, message) {
  var error = new Error(message);
  error.status = statusCode;
  return error;
}

module.exports = {
  create : create,
  missingProperty : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" missing in body')
  },
  unexpectedProperty : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" not allowed in body')
  },
  missingParameter : function (parameterName) {
    return create(404, 'Parameter "' + parameterName + '" missing in url')
  },
  notFound : function (resourceName) {
    return create(404, resourceName + ' not found')
  }
};
