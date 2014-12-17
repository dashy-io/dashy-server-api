'use strict';
var chai = require('chai');
var chaiString = require('chai-string');
var errorGenerator = require('../../lib/errorGenerator');
var assert = chai.assert;
chai.use(chaiString);

describe('Error Generator', function () {
  it('generates error with custom status code and message', function () {
    var error = errorGenerator.create(500, 'custom error');
    assert.equal(error.status, 500);
  });
  it('generates 400 Bad Request for missing property', function () {
    var error = errorGenerator.missingProperty('propertyName');
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Property "propertyName" missing in body');
  });
  it('generates 400 Bad Request for unexpected property', function () {
    var error = errorGenerator.unexpectedProperty('propertyName');
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Property "propertyName" not allowed in body');
  });
  it('generates 400 Bad Request for not matching property', function () {
    var error = errorGenerator.notMatchingProperty('propertyName');
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Property "propertyName" in body must match parameter "propertyName" in url');
  });
  it('generates 401 Unauthorized', function () {
    var error = errorGenerator.unauthorized('message');
    assert.equal(error.status, 401);
    assert.equal(error.message, 'Unauthorized: message');
  });
  it('generates 403 Forbidden', function () {
    var error = errorGenerator.forbidden('message');
    assert.equal(error.status, 403);
    assert.equal(error.message, 'Forbidden: message');
  });
  it('generates 404 Not Found for missing parameter', function () {
    var error = errorGenerator.missingParameter('ID');
    assert.equal(error.status, 404);
    assert.equal(error.message, 'Parameter "ID" missing in url');
  });
  it('generates 404 Not Found for when resource not found', function () {
    var error = errorGenerator.notFound('User');
    assert.equal(error.status, 404);
    assert.equal(error.message, 'User not found');
  });
});
