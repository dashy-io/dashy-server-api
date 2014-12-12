'use strict';

module.exports = {
  requireProperties : function (body, requiredProperties) {
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
};
