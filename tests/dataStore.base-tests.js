'use strict';
var uuid = require('node-uuid');
var chai = require('chai');
var chaiString = require('chai-string');

function testDataStore(dataStore) {
  var assert = chai.assert;
  chai.use(chaiString);

  var dashboardsToCleanup = [];

  function createDashboard() {
    var newId = 'test-dashboard-' + uuid.v4();
    dashboardsToCleanup.push(newId);
    return {
      id: newId,
      code: "12345678",
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

  after('DataStore Cleanup', function (done) {
    if (dashboardsToCleanup.length === 0) {
      return done();
    }
    this.timeout(30000);
    var deletedCount = 0;
    console.log('Cleaning up (DataStore)...');
    console.log(dashboardsToCleanup);
    dashboardsToCleanup.forEach(function (id) {
      dataStore.deleteDashboard(id, function (err, deleted) {
        if (err) { console.log(err); }
        deletedCount++;
        if (deletedCount === dashboardsToCleanup.length) {
          console.log('Done.');
          return done();
        }
      });
    });
  });

  describe('Getting a dashboard', function () {
    it('returns a valid dashboard', function (done) {
      var newDashboard = createDashboard();
      dataStore.createDashboard(newDashboard, function (err) {
        if (err) { return done(err); }
        pataStore.getDashboard(newDashboard.id, function (err, dashboard) {
          if (err) {
            return done(err);
          }
          assert.deepEqual(dashboard, newDashboard);
          done();
        })
      });
    });
    it('does not return a non-existing dashboard', function (done) {
      pataStore.getDashboard('test-dashboard-bad', function (err, dashboard) {
        if (err) { return done(err); }
        assert.isNull(dashboard);
        done();
      })
    });
  });

  describe('Creating a dashboard', function () {
    it('creates a new dashboard', function (done) {
      var newDashboard = createDashboard();
      dataStore.createDashboard(newDashboard, function (err, createdDashboard) {
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
      dataStore.createDashboard(newDashboard, function (err, createdDashboard) {
        if (err) { return done(err); }
        createdDashboard.name += ' EDITED';
        dataStore.updateDashboard(createdDashboard.id, createdDashboard, function (err, updatedDashboard) {
          if (err) { return done(err); }
          assert.equal(updatedDashboard.name, createdDashboard.name);
          done();
        });
      });
    });
    it('persists additional fields', function (done) {
      var newDashboard = createDashboard();
      newDashboard.additional1 = 'additional field 1';
      dataStore.createDashboard(newDashboard, function (err, createdDashboard) {
        if (err) { return done(err); }
        createdDashboard.additional2 = 'additional field 2';
        dataStore.updateDashboard(createdDashboard.id, createdDashboard, function (err, updatedDashboard) {
          if (err) { return done(err); }
          dataStore.getDashboard(createdDashboard.id, function (err, dashboard) {
            if (err) { return done(err); }
            assert.equal(dashboard.additional1, 'additional field 1');
            assert.equal(dashboard.additional2, 'additional field 2');
            assert.deepEqual(dashboard, updatedDashboard);
            done();
          });
          done();
        });
      });
    });
    it('does not update a non-existing dashboard', function (done) {
      var newDashboard = createDashboard();
      dataStore.updateDashboard(newDashboard.id, newDashboard, function (err, updatedDashboard) {
        if (err) { return done(err); }
        assert.isNull(updatedDashboard);
        done();
      });
    });
  });

  describe('Deleting a dashboard', function () {
    it('deletes a valid dashboard', function (done) {
      var newDashboard = createDashboard();
      dataStore.createDashboard(newDashboard, function (err) {
        if (err) { return done(err); }
        dataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
          if (err) { return done(err); }
          assert.isTrue(deleted);
          done();
        });
      });
    });
    it('does not delete a non-existing dashboard', function (done) {
      var newDashboard = createDashboard();
      dataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
        if (err) { return done(err); }
        assert.isFalse(deleted);
        done();
      });
    });
  });
}

module.exports = testDataStore();
