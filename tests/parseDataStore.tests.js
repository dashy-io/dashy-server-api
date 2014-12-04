'use strict';
var uuid = require('node-uuid');
var chai = require('chai');
var chaiString = require('chai-string');

var parseDataStore = require('../lib/parseDataStore');
var assert = chai.assert;
chai.use(chaiString);

function createDashboard() {
  return {
    id : 'test-dashboard-' + uuid.v4(),
    code : "12345678",
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

describe('Getting a dashboard', function () {
  it('returns a valid dashboard', function (done) {
    var newDashboard = createDashboard();
    parseDataStore.createDashboard(newDashboard, function (err) {
      if (err) { return done(err); }
      parseDataStore.getDashboard(newDashboard.id, function(err, dashboard) {
        if (err) { return done(err); }
        assert.deepEqual(dashboard, newDashboard);
        done();
      })
    });
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
    var newDashboard = createDashboard();
    parseDataStore.createDashboard(newDashboard, function (err, createdDashboard) {
      if (err) { return done(err); }
      assert.deepEqual(createdDashboard, newDashboard);
      assert.startsWith(createdDashboard.id, 'test-dashboard-');
      done();
    });
  });
});

describe('Updating a dashboard', function () {
  it('updates a valid dashboard', function (done) {
    var newDashboard = createDashboard();
    parseDataStore.createDashboard(newDashboard, function (err, createdDashboard) {
      if (err) { return done(err); }
      createdDashboard.name += ' EDITED';
      parseDataStore.updateDashboard(createdDashboard.id, createdDashboard, function (err, updatedDashboard) {
        if (err) { return done(err); }
        assert.equal(updatedDashboard.name, createdDashboard.name);
        done();
      });
    });
  });
  it('does not update a non-existing dashboard', function (done) {
    var newDashboard = createDashboard();
    parseDataStore.updateDashboard(newDashboard.id, newDashboard, function (err, updatedDashboard) {
      if (err) { return done(err); }
      assert.isNull(updatedDashboard);
      done();
    });
  });
});

describe('Deleting a dashboard', function () {
  it('deletes a valid dashboard', function (done) {
    var newDashboard = createDashboard();
    parseDataStore.createDashboard(newDashboard, function (err) {
      if (err) { return done(err); }
      parseDataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
        if (err) { return done(err); }
        assert.isTrue(deleted);
        done();
      });
    });
  });
  it('does not delete a non-existing dashboard', function (done) {
    var newDashboard = createDashboard();
    parseDataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
      if (err) { return done(err); }
      assert.isFalse(deleted);
      done();
    });
  });
});
