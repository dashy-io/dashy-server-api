'use strict';
var uuid = require('node-uuid');
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');
var app = require('../../app');
var testHelpers = require('../test-helpers');
var tokens = require('../../lib/tokens');
var assert = chai.assert;
request = request(app);
chai.use(chaiString);

after('API Cleanup', function (done) {
  this.timeout(30000);
  testHelpers.cleanup(done);
});

// TODO: test that only json is allowed in PUT and POST
// TODO: Test ~/users/:user-id/dashboards

describe('POST ~/users', function () {
  it('returns 400 Bad Request if id specified', function (done) {
    var newUser = testHelpers.createNewUser();
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
    var newUser = testHelpers.createNewUser();
    newUser.unexpected = 'value';
    request.post('/users')
      .send(newUser)
      .expect(400)
      .expect({ message : 'Property "unexpected" not allowed in body' })
      .end(done);
  });
  it('creates a new user', function (done) {
    var newUser = testHelpers.createNewUser();
    request.post('/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var createdUser = res.body;
        testHelpers.addUserToCleanup(createdUser.id);
        newUser.id = createdUser.id;
        assert.lengthOf(createdUser.id, 41);
        assert.match(createdUser.id, /user-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        assert.deepEqual(newUser, createdUser);
        done();
      });
  });
  // TODO: Try get after create
  // TODO: What happens if no dashboards specified?
  // TODO: Handle duplicate Google User ID Creation
});

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
    testHelpers.postNewUser(function(err, user) {
      if (err) { return done(err); }
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
      .send(testHelpers.createNewUser())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'User not found' })
      .end(done);
  });
  it('returns 400 Bad Request if ID in body different', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
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
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
      delete user.email;
      request.put('/users/' + user.id)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "email" missing in body' })
        .end(done)
    });
  });
  it('returns 400 Bad Request if name not specified', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
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
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
      user.unexpected = 'value';
      request.put('/users/' + user.id)
        .send(user)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "unexpected" not allowed in body' })
        .end(done)
    });
  });
  it('updates a valid user', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
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
  // TODO: Try get after update
});

describe('DELETE ~/users/:user-id', function () {
  it('returns 404 Not Found if ID missing from url', function (done) {
    request.delete('/users')
      .expect(404)
      .expect({ message : 'Parameter "id" missing in url' })
      .end(done);
  });
  it('returns 404 Not Found for non-existing users', function (done) {
    request.delete('/users/' + uuid.v4())
      .expect(404)
      .expect({ message: 'User not found'})
      .end(done);
  });
  it('deletes a valid dashboard', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
      request.delete('/users/' + user.id)
        .expect(204)
        .expect('')
        .end(done)
    });
  });
  // TODO: Try get after delete
});

describe('POST ~/users/:user-id/dashboards', function () {
  it('returns 404 Not Found for non-existing users', function (done) {
    request.post('/users/' + uuid.v4() + '/dashboards')
      .send({ code: '12345678' })
      .expect(404)
      .expect({ message: 'User not found'})
      .end(done);
  });
  it('returns 400 Bad Request if Dashboard Code not specified', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
      request.post('/users/' + user.id + '/dashboards')
        .send({})
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Property "code" missing in body' })
        .end(done)
    });
  });
  it('returns 404 Not Found if Dashboard Code not valid', function (done) {
    testHelpers.postNewUser(function (err, user) {
      if (err) { return done(err); }
      request.post('/users/' + user.id + '/dashboards')
        .send({ code : '123456' })
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Dashboard not found' })
        .end(done);
    });
  });
  // TODO: Handle duplicate dashboard connection
  it('connects a dashboard', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      request.get('/dashboards/' + dashboard.id + '/code')
        .end(function (err, res) {
          if (err) { return done(err); }
          var code = res.body.code;
          testHelpers.postNewUser(function (err, user) {
            if (err) { return done(err); }
            request.post('/users/' + user.id + '/dashboards')
              .send({ code : code })
              .expect(201)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect([ 'example-dashboard', dashboard.id ])
              .end(done)
          });
        });
    });
  });
  // TODO: Try get after update
  // TODO: Error if dashboard already connected to another user
  // TODO: A dashboard can be connected multiple times to the same user
});

describe('GET ~/user', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
  request.get('/user')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
    .end(done)
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
  request.get('/user')
    .set('Authorization', 'Bearer')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
    .end(done)
  });
  it('returns 401 Unauthorized if token invalid', function (done) {
  request.get('/user')
    .set('Authorization', 'Bearer 123abc')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Invalid token' })
    .end(done)
  });
  it('returns valid user', function (done) {
    testHelpers.postNewUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err) }
        request.get('/user')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(user)
          .end(done)
      });
    });
  });
  it('returns 404 Not Found when the user mapped to a token not found', function (done) {
    tokens.create(uuid.v4(), function (err, token) {
      if (err) { return done(err) }
      request.get('/user')
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'User associated with token not found' })
        .end(done)
    });
  });
});
