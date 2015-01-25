'use strict';
var uuid = require('node-uuid');
var chai = require('chai');
var chaiString = require('chai-string');
var tokens = require('../../lib/tokens');
var assert = chai.assert;
chai.use(chaiString);

describe('Creating a token', function () {
  it('Does not create it if no User ID specified', function (done) {
    tokens.create('', function (err, token) {
      if (err) { return done(err) }
      assert.isNull(token);
      done();
    });
  });
  it('Creates a new token for a valid User ID', function (done) {
    tokens.create(uuid.v4(), function (err, token) {
      if (err) { return done(err) }
      assert.isString(token);
      assert.lengthOf(token, 172);
      done();
    });
  });
});

describe('Getting the User ID associated with a token', function () {
  it('Does not return any value if no User ID specified', function (done) {
    tokens.getUserId('', function (err, userId) {
      if (err) { return done(err) }
      assert.isNull(userId);
      done();
    });
  });
  it('Does not return any value for a bad token', function (done) {
    tokens.getUserId('bad-token', function (err, userId) {
      if (err) { done(err) }
      assert.isNull(userId);
      done();
    });
  });
  it('Returns a User ID for a valid token', function (done) {
    var newUserId = uuid.v4();
    tokens.create(newUserId, function (err, token) {
      if (err) { return done(err) }
      tokens.getUserId(token, function (err, userId) {
        if (err) { done(err) }
        assert.equal(userId, newUserId);
        done();
      });
    });
  });
});

describe('Parsing authorization header', function () {
  it('Does not parse empty header', function () {
    var token = tokens.parseHeader('');
    assert.isNull(token);
  });
  it('Does not parse malformed header too few parts', function () {
    var token = tokens.parseHeader('Bearer');
    assert.isNull(token);
  });
  it('Does not parse malformed header with too many parts', function () {
    var token = tokens.parseHeader('Bearer 123456 ABC');
    assert.isNull(token);
  });
  it('Does not parse unexpected authorization type', function () {
    var token = tokens.parseHeader('Basic 123456');
    assert.isNull(token);
  });
  it('Parses Bearer authorization header', function () {
    var token = tokens.parseHeader('Bearer 123456');
    assert.isString(token);
    assert.lengthOf(token, 6);
    assert.equal(token, '123456');
  });
});

