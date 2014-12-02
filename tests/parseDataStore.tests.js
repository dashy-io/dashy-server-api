'use strict';

var uuid = require('node-uuid');
var chai = require('chai');
var parseDataStore = require('../lib/parseDataStore');
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

describe('Getting a dashboard', function () {
  it('returns a valid dashboard', function (done) {
    parseDataStore.getDashboard('test-dashboard', function(err, dashboard) {
      if (err) { return done(err); }
      assert.deepEqual(dashboard, testDashboard);
      done();
    })
  });

  it('does not return a non-existing dashboard', function (done) {
    parseDataStore.getDashboard('test-dashboard-bad', function(err, dashboard) {
      if (err) { return done(err); }
      assert.isNull(dashboard);
      done();
    })
  });
});

describe('Creating a dashboard', function () {
  it('creates a new dashboard', function (done) {
    this.timeout(5000);
    var newDashboardClone = JSON.parse(JSON.stringify(newDashboard));
    newDashboardClone.id = 'test-dashboard-' + uuid.v4();
    parseDataStore.createDashboard(newDashboardClone, function (err, createdDashboard) {
      if (err) { return done(err); }
      assert.deepEqual(createdDashboard, newDashboardClone);
      assert.startsWith(createdDashboard.id, 'test-dashboard-');
      done();
    });
  });

  it('does not overwrite an existing dashboard', function (done) {
    parseDataStore.createDashboard(testDashboard, function (err, dashboard) {
      assert.equal(err.message, 'DataStore error: A dashboard with the same ID exists');
      assert.isUndefined(dashboard);
      done();
    })
  });
});

describe('Updating a dashboard', function () {
  it('updates a valid dashboard', function (done) {
    this.timeout(5000);
    var newDashboardClone = JSON.parse(JSON.stringify(newDashboard));
    newDashboardClone.id = 'test-dashboard-' + uuid.v4();
    parseDataStore.createDashboard(newDashboardClone, function (err, createdDashboard) {
      if (err) { return done(err); }
      createdDashboard.name += ' EDITED';
      parseDataStore.updateDashboard(createdDashboard.id, createdDashboard, function (err, updatedDashboard) {
        if (err) { return done(err); }
        assert.endsWith(updatedDashboard.name, ' EDITED');
        done();
      });
    });
  });

  it('does not update a non-existing dashboard', function (done) {
    var nonExistingId = uuid.v4();
    parseDataStore.updateDashboard(nonExistingId, testDashboard, function (err, updatedDashboard) {
      if (err) { return done(err); }
      assert.isNull(updatedDashboard);
      done();
    });
  });
});

describe('Deleting a dashboard', function () {
  it('deletes a valid dashboard', function (done) {
    this.timeout(5000);
    var newDashboardClone = JSON.parse(JSON.stringify(newDashboard));
    newDashboardClone.id = 'test-dashboard-' + uuid.v4();
    parseDataStore.createDashboard(newDashboardClone, function (err, createdDashboard) {
      if (err) { return done(err); }
      parseDataStore.deleteDashboard(newDashboardClone.id, function (err, deleted) {
        if (err) { return done(err); }
        assert.isTrue(deleted);
        done();
      });
    });
  });
  it('does not delete a non-existing dashboard', function (done) {
    var nonExistingId = uuid.v4();
    parseDataStore.deleteDashboard(nonExistingId, function (err, deleted) {
      if (err) { return done(err); }
      assert.isFalse(deleted);
      done();
    });
  });
});

