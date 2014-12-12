'use strict';
var chai = require('chai');
var chaiString = require('chai-string');
var validator = require('../lib/validator');
var assert = chai.assert;
chai.use(chaiString);

describe('Validating required properties', function () {
  it('handles no required properties', function () {
    var validationResult = validator.hasRequiredProperties({});
    assert.isNull(validationResult);
  });
  it('handles no body', function () {
    var validationResult = validator.hasRequiredProperties();
    assert.isNull(validationResult);
  });
  it('does not validate missing property on a null body', function () {
    var validationResult = validator.hasRequiredProperties(null, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.missingProperty, 'property1')
  });
  it('does not validate missing property', function () {
    var validationResult = validator.hasRequiredProperties({ prop : 'value' }, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.missingProperty, 'property1')
  });
  it('validates property', function () {
    var validationResult = validator.hasRequiredProperties({ prop : 'value' }, ['prop']);
    assert.isNull(validationResult);
  });
});
