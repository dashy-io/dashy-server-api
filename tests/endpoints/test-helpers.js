'use strict';
var uuid = require('node-uuid');
var request = require('supertest');
var dataStore = require('../../lib/dataStore').getDataStore();
var app = require('../../app');
request = request(app);
var usersToCleanup = [];
var dashboardsToCleanup = [];

function cleanupUsers (done) {
  if (usersToCleanup.length === 0) { return done(); }
  var deletedCount = 0;
  var errorCount = 0;
  console.log('Cleaning up (Users)...');
  usersToCleanup.forEach(function (id) {
    dataStore.deleteUser(id, function(err) {
      if (err) {
        errorCount++;
        console.log(err);
      }
      deletedCount++;
      if (deletedCount === usersToCleanup.length) {
        console.log('Cleaned: ' + usersToCleanup.length + ', errors: ' + errorCount);
        return done();
      }
    });
  });
}

function cleanupDashboards(done) {
  if (dashboardsToCleanup.length === 0) { return done(); }
  var deletedCount = 0;
  var errorCount = 0;;
  console.log('Cleaning up (Dashbaords)...');
  dashboardsToCleanup.forEach(function (id) {
    dataStore.deleteDashboard(id, function(err, deleted) {
      if (err) {
        errorCount++;
        console.log(err);
      }
      deletedCount++;
      if (deletedCount === dashboardsToCleanup.length) {
        console.log('Cleaned: ' + dashboardsToCleanup.length + ', errors: ' + errorCount);
        return done();
      }
    });
  });
}

module.exports = {
  addUserToCleanup : function (id) {
    usersToCleanup.push(id);
  },
  createNewUser : function () {
    return {
      name : 'Test User',
      email : 'test-user' + uuid.v4() + '@example.com',
      dashboards : [ 'example-dashboard' ]
    };
  },
  post : function (cb) {
    var newUser = this.createNewUser();
    request.post('/users')
      .send(newUser)
      .end(function(err, res) {
        if (err) { return cb(err); }
        var createdUser = res.body;
        usersToCleanup.push(createdUser.id);
        cb(null, createdUser);
      });
  },
  newDashboardId : function () {
    var newDashboardId = 'test-dashboard-' + uuid.v4();
    dashboardsToCleanup.push(newDashboardId);
    return newDashboardId;
  },
  getDashboardUpdate : function () {
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
  },
  cleanup : function (done) {
    cleanupUsers(function () {
      cleanupDashboards(done);
    });
  }
};

