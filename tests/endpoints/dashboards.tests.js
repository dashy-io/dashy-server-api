'use strict';
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');
var app = require('../../app');
var uuid = require('node-uuid');
var tokens = require('../../lib/tokens');
var testHelpers = require('./../test-helpers');
var assert = chai.assert;
request = request(app);
chai.use(chaiString);

after('API Cleanup', function (done) {
  this.timeout(30000);
  testHelpers.cleanup(done);
});

describe('POST ~/dashboards', function () {
  it('creates a minimal new dashboard', function (done) {
    request.post('/dashboards')
      .send()
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var newDashboard = res.body;
        assert.lengthOf(newDashboard.id, 51);
        assert.startsWith(newDashboard.id, 'test-dashboard-');
        assert.match(newDashboard.id, /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        testHelpers.addDashboardToCleanup(newDashboard.id);
        done();
      });
  });
  it('creates a new dashboard', function (done) {
    var expectedName = 'Test Dashboard - dashboards.tests.js';
    request.post('/dashboards')
      .send({ name : expectedName })
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var newDashboard = res.body;
        assert.startsWith(newDashboard.id, 'test-dashboard-');
        assert.equal(newDashboard.name, expectedName);
        done();
      });
  });
  it('returns 400 Bad Request if other parameters in body', function (done) {
    request.post('/dashboards')
      .send({ id: 'test-dashboard-' + uuid.v4(), other : 'other field' })
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message: 'Property "id" not allowed in body' })
      .end(done);
  });
});

describe('GET ~/dashboards/:dashboard-id', function () {
  it('returns valid dashboard', function (done) {
    testHelpers.postAndPutDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(dashboard)
        .end(done)
    });
  });
  it('does not return code property', function (done) {
    testHelpers.postAndPutDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if(err) { return done(err); }
          assert.isUndefined(res.body.code);
          done();
        });
    });
  });
  it('returns 404 Not Found for non-existing dashboards', function (done) {
    request.get('/dashboards/' + testHelpers.newDashboardId())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
  it('returns 404 Not Found if ID missing from url', function (done) {
    request.get('/dashboards/')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard ID missing from url' })
      .end(done)
    });
});

describe('PUT ~/dashboards/:dashboard-id', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
    request.put('/dashboards/' + uuid.v4())
      .send({})
      .expect(401)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
      .end(done);
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.put('/dashboards/' + uuid.v4())
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
      request.put('/dashboards/' + uuid.v4())
        .set('Authorization', 'Bearer 123abc')
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Invalid token' })
        .end(done);
    });
  });
  it('returns 403 Forbidden if the authenticated user\'s dashboard is undefined', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.put('/dashboards/' + uuid.v4())
          .set('Authorization', 'Bearer ' + token)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Forbidden: You can\'t update this resource' })
          .end(done);
      });
    });
  });
  it('returns 403 Forbidden if the authenticated user is not the dashboard owner', function (done) {
    var userData = {
      dashboards: ['nope']
    };
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.put('/dashboards/' + uuid.v4())
          .set('Authorization', 'Bearer ' + token)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Forbidden: You can\'t update this resource' })
          .end(done);
      });
    });
  });
  it('updates a valid dashboard', function (done) {
    testHelpers.postEmptyDashboard(function(err, createdDashboard) {
      if (err) { return done(err); }
      var updatedDashboard = testHelpers.getDashboardUpdate();
      updatedDashboard.name += 'Test Dashboard - EDITED';
      var expectedDashboard = JSON.parse(JSON.stringify(updatedDashboard));
      expectedDashboard.id = createdDashboard.id;
      var userData = {
        dashboards: [createdDashboard.id]
      };
      testHelpers.createUser(userData, function(err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          request.put('/dashboards/' + createdDashboard.id)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedDashboard)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(expectedDashboard)
            .end(done);
        });
      });
    });
  });
  // TODO: Try get after update
  it('returns 404 Not Found for non-existing dashboards', function (done) {
    var dashboardId = testHelpers.newDashboardId();
    var userData = {
      dashboards: [dashboardId]
    };
    testHelpers.createUser(userData, function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.put('/dashboards/' + dashboardId)
          .set('Authorization', 'Bearer ' + token)
          .send(testHelpers.getDashboardUpdate())
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Dashboard not found' })
          .end(done);
      });
    });
  });
  it('returns 409 Conflict if dashboard ID in body does not match :dashboard-id parameter', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if(err) { return done(err); }
      var dashboardUpdateWithId = testHelpers.getDashboardUpdate();
      dashboardUpdateWithId.id = testHelpers.newDashboardId();
      var userData = {
        dashboards: [dashboard.id]
      };
      testHelpers.createUser(userData, function(err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          request.put('/dashboards/' + dashboard.id)
            .set('Authorization', 'Bearer ' + token)
            .send(dashboardUpdateWithId)
            .expect(409)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect({ message : 'Dashboard ID in request body does not match ID in url' })
            .end(done);
        });
      });
    });
  });
  it('returns 400 Bad Request if unexpected properties in body', function (done) {
    testHelpers.postAndPutDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      dashboard.other = 'other field';
      var userData = {
        dashboards: [dashboard.id]
      };
      testHelpers.createUser(userData, function(err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          request.put('/dashboards/' + dashboard.id)
            .set('Authorization', 'Bearer ' + token)
            .send(dashboard)
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect({ message: 'Parameter "other" not allowed in body' })
            .end(done);
        });
      });
    });
  });
  it('returns 409 Conflict if trying to modify code property', function (done) {
    testHelpers.postEmptyDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      var dashboardUpdateWithCode = testHelpers.getDashboardUpdate();
      dashboardUpdateWithCode.code = '12345678';
      var userData = {
        dashboards: [dashboard.id]
      };
      testHelpers.createUser(userData, function(err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          request.put('/dashboards/' + dashboard.id)
            .set('Authorization', 'Bearer ' + token)
            .send(dashboardUpdateWithCode)
            .expect(409)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect({ message: 'Property "code" cannot be changed' })
            .end(done);
        });
      });
    });
  });
  it('returns 404 Not Found if ID missing from url', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.put('/dashboards')
          .set('Authorization', 'Bearer ' + token)
          .send({})
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Dashboard ID missing from url'})
          .end(done);
      });
    });
  });
});

describe('DELETE ~/dashboards/:dashboard-id', function () {
  it('returns 401 Unauthorized if Authorization header not provided', function (done) {
    request.delete('/dashboards/' + uuid.v4())
      .send({})
      .expect(401)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Unauthorized: Missing or invalid Authorization header' })
      .end(done);
  });
  it('returns 401 Unauthorized if token not provided', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      request.delete('/dashboards/' + uuid.v4())
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
      request.delete('/dashboards/' + uuid.v4())
        .set('Authorization', 'Bearer 123abc')
        .send({})
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Unauthorized: Invalid token' })
        .end(done);
    });
  });
  it('returns 403 Forbidden if the authenticated user\'s dashboard is undefined', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.delete('/dashboards/' + uuid.v4())
          .set('Authorization', 'Bearer ' + token)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Forbidden: You can\'t update this resource' })
          .end(done);
      });
    });
  });
  it('returns 403 Forbidden if the authenticated user is not the dashboard owner', function (done) {
    var userData = {
      dashboards: ['nope']
    };
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.delete('/dashboards/' + uuid.v4())
          .set('Authorization', 'Bearer ' + token)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({ message : 'Forbidden: You can\'t update this resource' })
          .end(done);
      });
    });
  });
  it('returns 404 Not Found for non-existing dashboard', function (done) {
    var newId = testHelpers.newDashboardId();
    var userData = {
      dashboards: [newId]
    };
    testHelpers.createUser(userData, function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.delete('/dashboards/' + newId)
          .set('Authorization', 'Bearer ' + token)
          .expect(404)
          .expect({ message: 'Dashboard not found'})
          .end(done);
      });
    });
  });
  it('deletes a valid dashboard', function (done) {
    testHelpers.postEmptyDashboard(function(err, createdDashboard) {
      if (err) { return done(err); }
      var userData = {
        dashboards: [createdDashboard.id]
      };
      testHelpers.createUser(userData, function(err, user) {
        if (err) { return done(err); }
        tokens.create(user.id, function (err, token) {
          if (err) { return done(err); }
          request.delete('/dashboards/' + createdDashboard.id)
            .set('Authorization', 'Bearer ' + token)
            .expect(204)
            .expect('')
            .end(done);
        });
      });
    });
  });
  // TODO: Try get after delete
  it('returns 404 Not Found if ID missing from url', function (done) {
    testHelpers.createUser(function(err, user) {
      if (err) { return done(err); }
      tokens.create(user.id, function (err, token) {
        if (err) { return done(err); }
        request.delete('/dashboards')
          .set('Authorization', 'Bearer ' + token)
          .expect(404)
          .expect({ message : 'Dashboard ID missing from url'})
          .end(done);
      });
    });
  });
});

describe('GET ~/dashboards/:dashboard-id/code', function () {
  it('returns code for new dashboards', function (done) {
    testHelpers.postEmptyDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id + '/code')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) { return done(err); }
          assert.isString(res.body.code);
          assert.match(res.body.code, /[A-z0-9]{6}/);
          done();
        })
    });
  });
  it('returns code for updated dashboard', function (done) {
    testHelpers.postEmptyDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id + '/code')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) { return done(err); }
          assert.isString(res.body.code);
          assert.match(res.body.code, /[A-z0-9]{6}/);
          done();
        })
    });
  });
  it('returns 404 Not Found for non-existing dashboards', function (done) {
    request.get('/dashboards/' + testHelpers.newDashboardId() + '/code')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
  // TODO: returns 404 Not Found if ID missing from url
});

// TODO: test that only json is allowed in PUT and POST
// TODO: we can get rid of postAndPutDashboard as we can POST it
