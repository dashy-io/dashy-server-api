'use strict';

module.exports = {
  requireProperties : function (body, requiredProperties) {
    if (!requiredProperties) {
      return null;
    }
    for (var i = 0; i < requiredProperties.length; i++) {
      var propertyName = requiredProperties[i];
      if (!body || !body[propertyName]) {
        return { missingProperty : propertyName }
      }
    }
    return null;
  },
  allowProperties : function (body, allowedProperties) {
    for (var propertyName in body) {
      if (body.hasOwnProperty(propertyName)) {
        if (allowedProperties.indexOf(propertyName) === -1) {
          return { unexpectedProperty : propertyName }
        }
      }
    }
    return null;
  }
};
