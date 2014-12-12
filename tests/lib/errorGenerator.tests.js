'use strict';
var chai = require('chai');
var chaiString = require('chai-string');
var errorGenerator = require('../../lib/errorGenerator');
var assert = chai.assert;
chai.use(chaiString);

describe('errorGenerator', function () {
  it('generates error with custom status code and message', function () {
    var error = errorGenerator.create(500, 'custom error');
    assert.equal(error.status, 500);
  });
  it('generates 400 Bad Request for missing property', function () {
    var error = errorGenerator.propertyMissing('propertyName');
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Property "propertyName" missing in body');
  });
});
