'use strict';

var uuid = require('node-uuid');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var assert = chai.assert;

chai.use(require('chai-string'));

var newDashboard = {
  "interval": 15,
  "name": "Test Dashboard",
  "urls": [
    "http://citydashboard.org/london/",
    "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
    "http://www.gridwatch.templar.co.uk/",
    "http://www.casa.ucl.ac.uk/weather/colours.html"
  ]
};
var testDashboard = {
  "id": "test-dashboard",
  "interval": 15,
  "name": "Test Dashboard",
  "urls": [
    "http://citydashboard.org/london/",
    "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
    "http://www.gridwatch.templar.co.uk/",
    "http://www.casa.ucl.ac.uk/weather/colours.html"
  ]
};

describe('GET ~/status', function () {
  it('returns 200 OK and the environment', function (done) {
    request(app)
      .get('/status')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      .expect('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      .expect({
          env : 'test'
        })
      .end(done);
  });
});

describe('GET ~/dashboards/:dashboard-id', function () {
  it('returns valid dashboard', function (done) {
    request(app)
      .get('/dashboards/test-dashboard')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(testDashboard)
      .end(done);
  });
  it('does not return non-existing dashboard', function (done) {
    request(app)
      .get('/dashboards/test-dashboard-bad')
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({
        message : 'Dashboard Not Found'
      })
      .end(done);
  });
});

describe('POST /dashboards', function () {
  it('creates a new dashboard', function (done) {
    request(app)
      .post('/dashboards')
      .send(newDashboard)
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        if (err) { return done(err); }
        var createdDashboard = res.body;
        var newDashboardClone = JSON.parse(JSON.stringify(newDashboard));
        newDashboardClone.id = createdDashboard.id;
        assert.deepEqual(createdDashboard, newDashboardClone);
        assert.isString(createdDashboard.id);
        assert.lengthOf(createdDashboard.id, 36);
        assert.match(createdDashboard.id, /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        done();
      });
  });
  it('returns 409 Conflict if dashboard ID in body', function (done) {
    this.timeout(5000);
    var testDashboardClone = JSON.parse(JSON.stringify(testDashboard));
    testDashboardClone.id += '-' + uuid.v4();
    request(app)
      .post('/dashboards')
      .send(testDashboardClone)
      .expect(409)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({
        message : 'ID property MUST NOT be set in body'
      })
      .end(done);
  });
});

describe('PUT /dashboards/:dashboard-id', function () {
  it('updates a valid dashboard', function (done) {
    this.timeout(5000);
    request(app)
      .post('/dashboards')
      .send(newDashboard)
      .end(function(err, res) {
        if (err) { return done(err); }
        var createdDashboardId = res.body.id;
        var editedDashboard = res.body;
        delete editedDashboard.id;
        editedDashboard.name += ' EDITED';
        var editedDashboardClone = JSON.parse(JSON.stringify(editedDashboard));
        editedDashboardClone.id = createdDashboardId;
        request(app)
          .put('/dashboards/' + createdDashboardId)
          .send(editedDashboard)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(editedDashboardClone)
          .end(done);
      });
  });
  it('returns 404 Not Found for non-existing dahsboard', function (done) {
    request(app)
      .put('/dashboards/test-dashboard-bad')
      .send(newDashboard)
      .expect(404)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({
        message : 'Dashboard Not Found'
      })
      .end(done);
  });
  it('returns 409 Conflict if dahsboard ID in body', function (done) {
    request(app)
      .put('/dashboards/test-dashboard')
      .send(testDashboard)
      .expect(409)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({
        message : 'ID property MUST NOT be set in body'
      })
      .end(done);
  });
});
describe('DELETE /dashboards/:dashboard-id', function () {
  it('deletes a valid dashboard', function (done) {
    this.timeout(5000);
    request(app)
      .post('/dashboards')
      .send(newDashboard)
      .end(function (err, res) {
        if (err) { return done(err); }
        var createdDashboardId = res.body.id;
        request(app)
          .delete('/dashboards/' + createdDashboardId)
          .expect(204)
          .expect('')
          .end(done);
      });
  });
  it('returns 404 Not Found for non-existing dashboard', function (done) {
      request(app)
        .delete('/dashboards/test-dashboard-bad')
        .expect(404)
        .expect({
          message: 'Dashboard Not Found'
        })
        .end(done);
  });
});
