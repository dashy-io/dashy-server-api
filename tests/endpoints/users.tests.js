'use strict';
var uuid = require('node-uuid');
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');

var app = require('../../app');
var dataStore = require('../../lib/dataStore').getDataStore();
var assert = chai.assert;
request = request(app);
chai.use(chaiString);

var usersToCleanup = [];

function createNewUser() {
  return {
    name : 'Test User',
    email : 'test-user' + uuid.v4() + '@example.com',
    dashboards : [ 'example-dashboard' ]
  };
}

after('API Cleanup', function (done) {
  if (usersToCleanup.length === 0) { return done(); }
  this.timeout(30000);
  var deletedCount = 0;
  console.log('Cleaning up (Users API)...');
  usersToCleanup.forEach(function (id) {
    dataStore.deleteUser(id, function(err) {
      if (err) { console.log(err); }
      deletedCount++;
      if (deletedCount === usersToCleanup.length) {
        console.log('Done.');
        return done();
      }
    });
  });
});

describe('POST ~/users', function () {
  it('returns 400 Bad Request if email not specified', function (done) {
    request.post('/users')
      .send()
      .expect(400)
      .expect({ message : 'Property "email" missing in body' })
      .end(done);
  });
  it('returns 400 Bad Request if name not specified', function (done) {
    request.post('/users')
      .send({ email: 'info@example.com' })
      .expect(400)
      .expect({ message : 'Property "name" missing in body' })
      .end(done);
  });
  it('returns 400 Bad Request if id specified', function (done) {
    var newUser = createNewUser();
    newUser.id = 'test-user-' + uuid.v4();
    request.post('/users')
      .send(newUser)
      .expect(400)
      .expect({ message : 'Property "id" not allowed in body' })
      .end(done);
  });
  it('returns 400 Bad Request if unexpected property specified', function (done) {
    var newUser = createNewUser();
    newUser.unexpected = 'value';
    request.post('/users')
      .send(newUser)
      .expect(400)
      .expect({ message : 'Property "unexpected" not allowed in body' })
      .end(done);
  });
  it('creates a new user', function (done) {
    var newUser = createNewUser();
    request.post('/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var createdUser = res.body;
        usersToCleanup.push(createdUser.id);
        newUser.id = createdUser.id;
        assert.lengthOf(createdUser.id, 41);
        assert.match(createdUser.id, /user-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        assert.deepEqual(newUser, createdUser);
        done();
      });
  });
});

// TODO: test that only json is allowed in PUT and POST
