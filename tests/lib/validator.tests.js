'use strict';
var chai = require('chai');
var chaiString = require('chai-string');
var validator = require('../../lib/validator');
var assert = chai.assert;
chai.use(chaiString);

describe('Validating required properties', function () {
  it('handles no required properties', function () {
    var validationResult = validator.requireProperties({});
    assert.isNull(validationResult);
  });
  it('handles no body', function () {
    var validationResult = validator.requireProperties();
    assert.isNull(validationResult);
  });
  it('does not validate missing property on a null body', function () {
    var validationResult = validator.requireProperties(null, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.missingProperty, 'property1')
  });
  it('does not validate missing property', function () {
    var validationResult = validator.requireProperties({ prop : 'value' }, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.missingProperty, 'property1')
  });
  it('validates property', function () {
    var validationResult = validator.requireProperties({ prop : 'value' }, ['prop']);
    assert.isNull(validationResult);
  });
  it('returns first missing property if more than one missing', function () {
    var validationResult = validator.requireProperties({ prop : 'value' }, ['property1', 'property2']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.missingProperty, 'property1')
  });
});

describe('Validating allowed properties', function () {
  it('handles no allowed properties', function () {
    var validationResult = validator.allowProperties({});
    assert.isNull(validationResult);
  });
  it('handles no body', function () {
    var validationResult = validator.allowProperties();
    assert.isNull(validationResult);
  });
  it('validates allowed property on a null body', function () {
    var validationResult = validator.allowProperties(null, ['property1']);
    assert.isNull(validationResult);
  });
  it('returns unexpected property', function () {
    var validationResult = validator.allowProperties({ unexpected : 'value' }, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.unexpectedProperty, 'unexpected')
  });
  it('validates property', function () {
    var validationResult = validator.allowProperties({ prop : 'value' }, ['prop']);
    assert.isNull(validationResult);
  });
  it('returns first unexpected property if more than one unexpected', function () {
    var validationResult = validator.allowProperties(
      { unexpected1 : 'value', unexpected2 : 'value' }, ['property1']);
    assert.isNotNull(validationResult);
    assert.equal(validationResult.unexpectedProperty, 'unexpected1')
  });
});

describe('Validating ID property', function () {
  it('validates the same id if provided', function () {
    var validationResult = validator.allowMatchingId({ id: '123'}, '123');
    assert.isNull(validationResult);
  });
  it('validates if ID property omitted', function () {
    var validationResult = validator.allowMatchingId({}, '123');
    assert.isNull(validationResult);
  });
  it('fails if ID property different', function () {
    var validationResult = validator.allowMatchingId({id: 'abc'}, '123');
    assert.equal(validationResult.notMatchingProperty, 'id');
  });
});

