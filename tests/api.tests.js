'use strict';

var uuid = require('node-uuid');
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');

var app = require('../app');
request = request(app);
var assert = chai.assert;
chai.use(chaiString);

function newDashboardId() {
  var newDashboardId = 'test-dashboard-' + uuid.v4()
  dashboardsToCleanup.push(newDashboardId);
  return newDashboardId;
}

function getDashboardUpdate() {
  return {
    interval: 15,
    name: "Test Dashboard",
    "urls": [
      "http://citydashboard.org/london/",
      "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
      "http://www.gridwatch.templar.co.uk/",
      "http://www.casa.ucl.ac.uk/weather/colours.html"
    ]
  }
}

var dashboardsToCleanup = [];
after('Cleanup', function (done) {
  done();
});

describe('GET ~/status', function () {
  it('returns 200 OK and the environment', function (done) {
    request.get('/status')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      .expect('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      .expect({ env : 'test' })
      .end(done);
  });
});

function postDashboard(cb) {
  request.post('/dashboards')
    .send({ id: newDashboardId() })
    .end(function (err, res) {
      if (err) { return cb(err); }
      cb(null, res.body);
    });
}

describe('POST ~/dashboards', function () {
  it('returns 400 Bad Request if ID not specified in body', function (done) {
    request.post('/dashboards')
      .send({ id: '' })
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message: 'Parameter "id" missing in body' })
      .end(done);
  });
  it('creates a new dashboard', function (done) {
    request.post('/dashboards')
      .send({ id: newDashboardId() })
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var newDashboard = res.body;
        assert.isString(newDashboard.id);
        assert.isString(newDashboard.code);
        assert.lengthOf(newDashboard.id, 51);
        assert.lengthOf(newDashboard.code, 8);
        assert.match(newDashboard.id, /test-dashboard-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        assert.match(newDashboard.code, /[A-z0-9]{8}/);
        done();
      });
  });
  it('returns 409 Conflict if dashboard already exists', function (done) {
    postDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      request.post('/dashboards')
        .send(dashboard)
        .expect(409)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Duplicate Dashboard ID' })
        .end(done);
    });
  });
});

function postAndPutDashboard(cb) {
  postDashboard(function (err, createdDashboard)  {
    if (err) { return cb(err); }
    request.put('/dashboards/' + createdDashboard.id)
      .send(getDashboardUpdate())
      .end(function (err, res) {
        if (err) {return cb(err); }
        cb(null, res.body);
      });
  });
}

describe('GET ~/dashboards/:dashboard-id', function () {
  it('returns valid dashboard', function (done) {
    this.timeout(3000);
    postAndPutDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(dashboard)
        .end(done);
    });
  });
  it('does not return non-existing dashboard', function (done) {
    request.get('/dashboards/' + newDashboardId())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
});

describe('PUT ~/dashboards/:dashboard-id', function () {
  it('updates a valid dashboard', function (done) {
    postDashboard(function(err, createdDashboard) {
      if (err) { return done(err); }
      var updatedDashboard = getDashboardUpdate();
      updatedDashboard.name += 'Test Dashboard - EDITED';
      var expectedDashboard = JSON.parse(JSON.stringify(updatedDashboard));
      expectedDashboard.id = createdDashboard.id;
      expectedDashboard.code = createdDashboard.code;
      request.put('/dashboards/' + createdDashboard.id)
        .send(updatedDashboard)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(expectedDashboard)
        .end(done);
    });
  });
  it('returns 404 Not Found for non-existing dashboard', function (done) {
    request.put('/dashboards/' + newDashboardId())
      .send(getDashboardUpdate())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
  it('returns 400 Bad Request if dashboard ID in body', function (done) {
    var dashboardUpdateWithId = getDashboardUpdate();
    dashboardUpdateWithId.id = newDashboardId();
    request.put('/dashboards/' + dashboardUpdateWithId.id)
      .send(dashboardUpdateWithId)
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Parameter "id" MUST NOT be set in body' })
      .end(done);
  });
  it('returns 400 Bad Request if dashboard code in body', function (done) {
    var dashboardUpdateWithCode = getDashboardUpdate();
    dashboardUpdateWithCode.code = '12345678';
    request.put('/dashboards/' + newDashboardId())
      .send(dashboardUpdateWithCode)
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Parameter "code" MUST NOT be set in body' })
      .end(done);
  });
});

describe('DELETE ~/dashboards/:dashboard-id', function () {
  it('deletes a valid dashboard', function (done) {
    var newId = newDashboardId();
    request.post('/dashboards')
      .send({ id: newId })
      .end(function (err) {
        if (err) { return done(err); }
        request.delete('/dashboards/' + newId)
          .expect(204)
          .expect('')
          .end(done);
      });
  });
  it('returns 404 Not Found for non-existing dashboard', function (done) {
    request.delete('/dashboards/' + newDashboardId())
      .expect(404)
      .expect({ message: 'Dashboard Not Found' })
      .end(done);
  });
});
