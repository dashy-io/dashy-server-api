'use strict';

var uuid = require('node-uuid');
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');

var app = require('../app');
var dataStore = require('../lib/parseDataStore');
request = request(app);
var assert = chai.assert;
chai.use(chaiString);

var dashboardsToCleanup = [];

function newDashboardId() {
  var newDashboardId = 'test-dashboard-' + uuid.v4();
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

after('API Cleanup', function (done) {
  if (dashboardsToCleanup.length === 0) { return done(); }
  this.timeout(30000);
  var deletedCount = 0;
  console.log('Cleaning up (API)...');
  console.log(dashboardsToCleanup);
  dashboardsToCleanup.forEach(function (id) {
    dataStore.deleteDashboard(id, function(err, deleted) {
      if (err) { console.log(err); }
      deletedCount++;
      if (deletedCount === dashboardsToCleanup.length) {
        console.log('Done.');
        return done();
      }
    });
  });
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
    var newId = newDashboardId();
    request.post('/dashboards')
      .send({ id: newId })
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ id: newId })
      .end(function(err, res) {
        if (err) { return done(err); }
        var newDashboard = res.body;
        assert.lengthOf(newDashboard.id, 51);
        assert.match(newDashboard.id, /test-dashboard-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
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
  it('returns 400 Bad Request if other parameters in body', function (done) {
    request.post('/dashboards')
      .send({ id: newDashboardId(), other : 'other field' })
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message: 'Parameter "other" not allowed in body' })
      .end(done);
  });
  it('returns 400 Bad Request if code parameter in body', function (done) {
    request.post('/dashboards')
      .send({ id: newDashboardId(), code : '11111111' })
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message: 'Parameter "code" not allowed in body' })
      .end(done);
  });
  // TODO: Does not create a dashboard with non-UUID id
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
    postAndPutDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(dashboard)
        .end(done)
    });
  });
  it('does not return code property', function (done) {
    postAndPutDashboard(function(err, dashboard) {
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
    request.get('/dashboards/' + newDashboardId())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
  // TODO: Returns 404 if ID missing
  // TODO: Does not return other parameters after POST
});

describe('PUT ~/dashboards/:dashboard-id', function () {
  it('updates a valid dashboard', function (done) {
    postDashboard(function(err, createdDashboard) {
      if (err) { return done(err); }
      var updatedDashboard = getDashboardUpdate();
      updatedDashboard.name += 'Test Dashboard - EDITED';
      var expectedDashboard = JSON.parse(JSON.stringify(updatedDashboard));
      expectedDashboard.id = createdDashboard.id;
      request.put('/dashboards/' + createdDashboard.id)
        .send(updatedDashboard)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(expectedDashboard)
        .end(done);
    });
  });
  it('returns 404 Not Found for non-existing dashboards', function (done) {
    request.put('/dashboards/' + newDashboardId())
      .send(getDashboardUpdate())
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard not found' })
      .end(done);
  });
  it('returns 409 Conflict if dashboard ID in body does not match :dashboard-id parameter', function (done) {
    postDashboard(function (err, dashboard) {
      if(err) { return done(err); }
      var dashboardUpdateWithId = getDashboardUpdate();
      dashboardUpdateWithId.id = newDashboardId();
      request.put('/dashboards/' + dashboard.id)
        .send(dashboardUpdateWithId)
        .expect(409)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message : 'Dashboard ID in request body does not match ID in url' })
        .end(done);
    });
  });
  it('returns 400 Bad Request if unexpected properties in body', function (done) {
    postAndPutDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      dashboard.other = 'other field';
      request.put('/dashboards/' + dashboard.id)
        .send(dashboard)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message: 'Parameter "other" not allowed in body' })
        .end(done);
    });
  });
  it('returns 409 Conflict if trying to modify code property', function (done) {
    postDashboard(function (err, dashboard) {
      if (err) { return done(err); }
      var dashboardUpdateWithCode = getDashboardUpdate();
      dashboardUpdateWithCode.code = '12345678';
      request.put('/dashboards/' + dashboard.id)
        .send(dashboardUpdateWithCode)
        .expect(409)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ message: 'Property "code" cannot be changed' })
        .end(done);
    });
  });
  // TODO: Returns 404 if ID missing
  // TODO: Does not return other parameters after POST
});

describe('DELETE ~/dashboards/:dashboard-id', function () {
  it('returns 404 Not Found for non-existing dashboard', function (done) {
    var newId = newDashboardId();
    request.delete('/dashboards/' + newId)
      .expect(404)
      .expect({ message: 'Dashboard not found'})
      .end(done);
  });
  it('deletes a valid dashboard', function (done) {
    postDashboard(function(err, createdDashboard) {
      if (err) { return done(err); }
      request.delete('/dashboards/' + createdDashboard.id)
        .expect(204)
        .expect('')
        .end(done);
    });
  });
  // TODO: Returns 404 if ID missing
});

describe('GET ~/dashboards/:dashboard-id/code', function () {
  it('returns code for new dashboards', function (done) {
    postDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id + '/code')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) { return done(err); }
          assert.match(res.body.code, /[A-z0-9]{8}/);
          done();
        })
    });
  });
  it('returns code for updated dashboard', function (done) {
    postDashboard(function(err, dashboard) {
      request.get('/dashboards/' + dashboard.id + '/code')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) { return done(err); }
          assert.match(res.body.code, /[A-z0-9]{8}/);
          done();
        })
    });
  });
  it('returns 404 Not Found for non-existing dashboards', function (done) {
    request.get('/dashboards/' + newDashboardId() + '/code')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ message : 'Dashboard Not Found' })
      .end(done);
  });
  // TODO: Returns 404 if ID missing
});
