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

// TODO: Test that only json is allowed in PUT and POST
// TODO: Test ~/users/:user-id/dashboards
// TODO: Handle duplicate Google User ID Creation

describe('POST ~/users', function () {
  it('returns 404 Not Found', function (done) {
    request.post('/users')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Not Found', url : '/users' })
      .end(done);
  });
});

describe('PUT ~/users', function () {
  it('returns 404 Not Found', function (done) {
    request.put('/users')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Not Found', url : '/users' })
      .end(done);
  });
//  it('returns 404 Not Found if ID missing from url', function (done) {
//    request.put('/users/')
//      .expect(404)
//      .expect('Content-Type', 'application/json; charset=utf-8')
//      .expect({ message : 'Parameter "id" missing in url' })
//      .end(done)
//  });
//  it('returns 404 Not Found for non-existing users', function (done) {
//    request.put('/users/' + uuid.v4())
//      .send(testHelpers.createNewUser())
//      .expect(404)
//      .expect('Content-Type', 'application/json; charset=utf-8')
//      .expect({ message : 'User not found' })
//      .end(done);
//  });
//  it('returns 400 Bad Request if ID in body different', function (done) {
//    testHelpers.postNewUser(function (err, user) {
//      if (err) { return done(err); }
//      var correctId = user.id;
//      user.id = 'test-user-' + uuid.v4();
//      request.put('/users/' + correctId)
//        .send(user)
//        .expect(400)
//        .expect('Content-Type', 'application/json; charset=utf-8')
//        .expect({ message : 'Property "id" in body must match parameter "id" in url' })
//        .end(done)
//    });
//  });
//  it('returns 400 Bad Request if email not specified', function (done) {
//    testHelpers.postNewUser(function (err, user) {
//      if (err) { return done(err); }
//      delete user.email;
//      request.put('/users/' + user.id)
//        .send(user)
//        .expect(400)
//        .expect('Content-Type', 'application/json; charset=utf-8')
//        .expect({ message : 'Property "email" missing in body' })
//        .end(done)
//    });
//  });
//  it('returns 400 Bad Request if name not specified', function (done) {
//    testHelpers.postNewUser(function (err, user) {
//      if (err) { return done(err); }
//      delete user.name;
//      request.put('/users/' + user.id)
//        .send(user)
//        .expect(400)
//        .expect('Content-Type', 'application/json; charset=utf-8')
//        .expect({ message : 'Property "name" missing in body' })
//        .end(done)
//    });
//  });
//  it('returns 400 Bad Request if unexpected property specified', function (done) {
//    testHelpers.postNewUser(function (err, user) {
//      if (err) { return done(err); }
//      user.unexpected = 'value';
//      request.put('/users/' + user.id)
//        .send(user)
//        .expect(400)
//        .expect('Content-Type', 'application/json; charset=utf-8')
//        .expect({ message : 'Property "unexpected" not allowed in body' })
//        .end(done)
//    });
//  });
//  it('updates a valid user', function (done) {
//    testHelpers.postNewUser(function (err, user) {
//      if (err) { return done(err); }
//      user.name += ' EDITED';
//      request.put('/users/' + user.id)
//        .send(user)
//        .expect(200)
//        .expect('Content-Type', 'application/json; charset=utf-8')
//        .expect(user)
//        .end(done)
//    });
//    // TODO: what happens if no dashboards specified?
//  });
//  // TODO: Try get after update
});

describe('POST ~/users/:user-id/dashboards', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.post('/users/' + user.id + '/dashboards')
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
        .end(done);
    });
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.post('/users/' + user.id + '/dashboards')
        .set('Authorization', 'Bearer')
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
        .end(done);
    });
  });
  it('returns 401 Unauthorized if token invalid', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.post('/users/' + user.id + '/dashboards')
        .set('Authorization', 'Bearer 123abc')
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Invalid token' })
        .end(done);
    });
  });
  it('returns 403 Forbidden if the authenticated user is different', function (done) {
    testHelpers.createUser(function(err, user1) {
      if (err) { return done(err); }
      testHelpers.createUser(function(err, user2) {
        if (err) { return done(err); }
        tokens.create(user2.id, function (err, token) {
          if (err) { return done(err); }
          request.post('/users/' + user1.id + '/dashboards')
            .set('Authorization', 'Bearer ' + token)
            .send({})
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect({ message : 'Forbidden: You can\'t update this resource' })
            .end(done);
        });
      });
    });
  });
  it('returns 404 Not Found for non-existing users', function (done) {
    var userId = uuid.v4();
    tokens.create(userId, function (err, token) {
      if (err) { return done(err); }
      request.post('/users/' + userId + '/dashboards')
        .set('Authorization', 'Bearer ' + token)
        .send({ code: '12345678' })
        .expect(404)
        .expect({ message: 'User associated with token not found'})
        .end(done);
    });
  });
  it('returns 400 Bad Request if Dashboard Code not specified', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.post('/users/' + user.id + '/dashboards')
          .set('Authorization', 'Bearer ' + token)
          .send({})
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Property "code" missing in body' })
          .end(done);
      });
    });
  });
  it('returns 404 Not Found if Dashboard Code not valid', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.post('/users/' + user.id + '/dashboards')
          .set('Authorization', 'Bearer ' + token)
          .send({ code : '123456' })
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Dashboard not found' })
          .end(done);
      });
    });
  });
  it('connects a dashboard', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      request.get('/dashboards/' + dashboard.id + '/code')
        .end(function (err, res) {
          if (err) { return done(err); }
          var code = res.body.code;
          testHelpers.createUser(function(err, user) {
            if (err) { return done(err); }
            tokens.create(user.id, function (err, token) {
              if (err) { return done(err); }
              request.post('/users/' + user.id + '/dashboards')
                .set('Authorization', 'Bearer ' + token)
                .send({ code : code })
                .expect(201)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect([ dashboard.id ])
                .end(function(){
                  request.get('/dashboards/' + dashboard.id + '/code')
                  .expect(200)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .expect({ code : null })
                  .end(done);
                });
            })
          });
        });
    });
  });
  it('connects a multiple time the same dashboard without generating duplicates', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      request.get('/dashboards/' + dashboard.id + '/code')
        .end(function (err, res) {
          if (err) { return done(err); }
          var code = res.body.code;
          testHelpers.createUser(function(err, user) {
            if (err) { return done(err); }
            tokens.create(user.id, function (err, token) {
              if (err) { return done(err); }
              request.post('/users/' + user.id + '/dashboards')
                .set('Authorization', 'Bearer ' + token)
                .send({ code : code })
                .expect(201)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect([ dashboard.id ])
                .end(function(err) {
                  if (err) { return done(err); }
                  request.post('/users/' + user.id + '/dashboards')
                    .set('Authorization', 'Bearer ' + token)
                    .send({ code : code })
                    .expect(404)
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect({ message: 'Dashboard not found' })
                    .end(done);
                });
            });
          });
        });
    });
  });
  // TODO: Try get after update
  // TODO: Error if dashboard already connected to another user
  // TODO: A dashboard can be connected multiple times to the same user
  // TODO: Test connecting multiple dashboards
});

describe('DELETE ~/users/:user-id/dashboards/:dashboard-id', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.delete('/users/' + user.id + '/dashboards/' + uuid.v4())
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
        .end(done);
    });
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.delete('/users/' + user.id + '/dashboards/' + uuid.v4())
        .set('Authorization', 'Bearer')
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
        .end(done);
    });
  });
  it('returns 401 Unauthorized if token invalid', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.delete('/users/' + user.id + '/dashboards/' + uuid.v4())
        .set('Authorization', 'Bearer 123abc')
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Invalid token' })
        .end(done);
    });
  });
  it('returns 403 Forbidden if the authenticated user is different', function (done) {
    testHelpers.createUser(function(err, user1) {
      if (err) { return done(err); }
      testHelpers.createUser(function(err, user2) {
        if (err) { return done(err); }
        tokens.create(user2.id, function (err, token) {
          if (err) { return done(err); }
          request.delete('/users/' + user1.id + '/dashboards/' + uuid.v4())
            .set('Authorization', 'Bearer ' + token)
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect({ message : 'Forbidden: You can\'t update this resource' })
            .end(done);
        });
      });
    });
  });
  it('returns 404 Not Found for non-existing users', function (done) {
    var userId = uuid.v4();
    tokens.create(userId, function (err, token) {
      if (err) { return done(err); }
      request.delete('/users/' + userId + '/dashboards/' + uuid.v4())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .expect({ message: 'User associated with token not found'})
        .end(done);
    });
  });
  it('returns 404 Not Found when dashboard not connected to user', function (done) {
    testHelpers.createUser(function (err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.delete('/users/' + user.id + '/dashboards/' + uuid.v4())
          .set('Authorization', 'Bearer ' + token)
          .expect(404)
          .expect({ message: 'Connected Dashboard not found'})
          .end(done);
      });
    });
  });
  it('deletes a dashboard connection', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          testHelpers.getDashboardCode(dashboard.id, function (err, dashboardCode) {
            if (err) { return done(err); }
            testHelpers.postDashboardConnection(user.id, dashboardCode, function (err, connectedDashboards) {
              if (err) { return done(err); }
              assert.deepEqual( connectedDashboards, [ dashboard.id ]);
              request.delete('/users/' + user.id + '/dashboards/' + dashboard.id)
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .expect([ ])
                .end(done);
            });
          });
        });
      });
    });
  });
});

describe('GET ~/user', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
  request.get('/user')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
    .end(done);
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
  request.get('/user')
    .set('Authorization', 'Bearer')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
    .end(done);
  });
  it('returns 401 Unauthorized if token invalid', function (done) {
  request.get('/user')
    .set('Authorization', 'Bearer 123abc')
    .expect(401)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ message : 'Unauthorized: Invalid token' })
    .end(done);
  });
  it('returns valid user', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.get('/user')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(user)
          .end(done);
      });
    });
  });
  it('returns 404 Not Found when the user mapped to a token not found', function (done) {
    tokens.create(uuid.v4(), function (err, token) {
      if (err) { return done(err); }
      request.get('/user')
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'User associated with token not found' })
        .end(done);
    });
  });
});
