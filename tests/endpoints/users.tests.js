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

// TODO: test that only json is allowed in PUT and POST

describe('POST ~/users', function () {
  it('returns 400 Bad Request if id specified', function (done) {
    var newUser = createNewUser();
    newUser.id = 'test-user-' + uuid.v4();
    request.post('/users')
      .send(newUser)
      .expect(400)
      .expect({ message : 'Property "id" not allowed in body' })
      .end(done);
  });
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
  // TODO: what happens if no dashboards specified?
});

function post(cb) {
  var newUser = createNewUser();
  request.post('/users')
    .send(newUser)
    .end(function(err, res) {
      if (err) { return cb(err); }
      var createdUser = res.body;
      usersToCleanup.push(createdUser.id);
      cb(null, createdUser);
    });
}

describe('GET ~/users/:user-id', function () {
  it('returns 404 Not Found if ID missing from url', function (done) {
    request.get('/users/')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Parameter "id" missing in url' })
      .end(done)
  });
  it('returns 404 Not Found for non-existing users', function (done) {
    request.get('/users/' + uuid.v4())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'User not found' })
      .end(done);
  });
  it('returns valid user', function (done) {
    post(function(err, user) {
      request.get('/users/' + user.id)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(user)
        .end(done)
    });
  });
});

describe('PUT ~/users/:user-id', function () {
  it('returns 404 Not Found if ID missing from url', function (done) {
    request.put('/users/')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Parameter "id" missing in url' })
      .end(done)
  });
  it('returns 404 Not Found for non-existing users', function (done) {
    request.put('/users/' + uuid.v4())
      .send(createNewUser())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'User not found' })
      .end(done);
  });
  it('returns 400 Bad Request if ID in body different', function (done) {
    post(function (err, user) {
      var correctId = user.id;
      user.id = 'test-user-' + uuid.v4();
      request.put('/users/' + correctId)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "id" in body must match parameter "id" in url' })
        .end(done)
    });
  });
  it('returns 400 Bad Request if email not specified', function (done) {
    post(function (err, user) {
      delete user.email;
      request.put('/users/' + user.id)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "email" missing in body' })
        .end(done)
    });
  });
  it('returns 400 Bad Request if email not specified', function (done) {
    post(function (err, user) {
      delete user.name;
      request.put('/users/' + user.id)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "name" missing in body' })
        .end(done)
    });
  });
  it('returns 400 Bad Request if unexpected property specified', function (done) {
    post(function (err, user) {
      user.unexpected = 'value';
      request.put('/users/' + user.id)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "unexpected" not allowed in body' })
        .end(done)
    });
  });
  it('updates valid user', function (done) {
    post(function (err, user) {
      user.name += ' EDITED';
      request.put('/users/' + user.id)
        .send(user)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(user)
        .end(done)
    });
    // TODO: what happens if no dashboards specified?
  });
});
