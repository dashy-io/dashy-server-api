'use strict';

function hasRequiredProperties(body, requiredProperties) {
  var validationResult = null;
  if (!requiredProperties) {
    return validationResult;
  }
  requiredProperties.forEach(function (propertyName) {
    if (validationResult) { return; }
    if (!body || !body[propertyName]) {
      validationResult = {
        missingProperty : propertyName
      }
    }
  });
  return validationResult;
}

module.exports = {
  hasRequiredProperties : hasRequiredProperties
};
