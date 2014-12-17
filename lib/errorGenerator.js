'use strict';

function create(statusCode, message) {
  var error = new Error(message);
  error.status = statusCode;
  return error;
}

module.exports = {
  create : create,
  missingProperty : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" missing in body');
  },
  unexpectedProperty : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" not allowed in body');
  },
  notMatchingProperty : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" in body must match parameter "' + propertyName + '" in url');
  },
  unauthorized : function (message) {
    return create(401, 'Unauthorized: ' + message);
  },
  forbidden : function (message) {
    return create(403, 'Forbidden: ' + message);
  },
  missingParameter : function (parameterName) {
    return create(404, 'Parameter "' + parameterName + '" missing in url');
  },
  notFound : function (resourceName) {
    return create(404, resourceName + ' not found');
  }
};
