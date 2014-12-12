'use strict';

function create(statusCode, message) {
  var error = new Error(message);
  error.status = statusCode;
  return error;
}

module.exports = {
  create : create,
  createPropertyMissing : function (propertyName) {
    return create(400, 'Property "' + propertyName + '" missing in body')
  }
};
