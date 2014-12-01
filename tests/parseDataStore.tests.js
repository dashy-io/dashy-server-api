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
      assert.deepEqual(dashboard, testDashboard);
      done();
    })
  });

  it('does not return a non-existing dashboard', function (done) {
    parseDataStore.getDashboard('test-dashboard-bad', function(err, dashboard) {
      assert.isNull(dashboard);
      done();
    })
  });
});

describe('Creating a dashboard', function () {
  it('creates a new dashboard', function (done) {
    this.timeout(5000);
    parseDataStore.createDashboard(newDashboard, function (err, dashboard) {
      var newDashboardCopy = JSON.parse(JSON.stringify(newDashboard));
      newDashboardCopy.id = dashboard.id;
      assert.isString(dashboard.id);
      assert.lengthOf(dashboard.id, 36);
      assert.match(dashboard.id, /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
      assert.deepEqual(dashboard, newDashboardCopy);
      done();
    });
  });

  it('does not overwrite an existing dashboard', function (done) {
    parseDataStore.createDashboard(testDashboard, function (err, dashboard) {
      assert.isNull(dashboard);
      done();
    })
  });

  it('creates a dashboard with the requested id', function (done) {
    var newDashboardCopy = JSON.parse(JSON.stringify(testDashboard));
    newDashboardCopy.id += '-' + uuid.v4();
    parseDataStore.createDashboard(newDashboardCopy, function (err, dashboard) {
      assert.equal(dashboard.id, newDashboardCopy.id);
      assert.startsWith(dashboard.id, testDashboard.id + '-');
      done();
    })
  });

});

describe('Updating a dashboard', function () {
  it('updates a valid dashboard', function (done) {
    this.timeout(5000);
    parseDataStore.createDashboard(newDashboard, function (err, createdDashboard) {
      createdDashboard.name += ' EDITED';
      parseDataStore.updateDashboard(createdDashboard.id, createdDashboard, function (err, updatedDashboard) {
        assert.endsWith(updatedDashboard.name, ' EDITED');
        done();
      });
    });
  });

  it('does not update a non-existing dashboard', function (done) {
    var nonExistingId = uuid.v4();
    parseDataStore.updateDashboard(nonExistingId, testDashboard, function (err, updatedDashboard) {
      assert.isNull(updatedDashboard);
      done();
    });
  });
});

describe('Deleting a dashboard', function () {
  it('deletes a valid dashboard', function (done) {
    this.timeout(5000);
    parseDataStore.createDashboard(newDashboard, function (err, createdDashboard) {
      parseDataStore.deleteDashboard(createdDashboard.id, function (err, deleted) {
        assert.isTrue(deleted);
        done();
      });
    });
  });
  it('does not delete a non-existing dashboard', function (done) {
    var nonExistingId = uuid.v4();
    parseDataStore.deleteDashboard(nonExistingId, function (err, deleted) {
      assert.isFalse(deleted);
      done();
    });
  });
});

