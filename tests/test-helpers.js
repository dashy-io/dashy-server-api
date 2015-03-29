'use strict';
var uuid = require('node-uuid');
var randToken = require('rand-token');
var request = require('supertest');
var users = require('../lib/users');
var dashboards = require('../lib/dashboards');
var app = require('../app');
var tokens = require('../lib/tokens');
request = request(app);
var usersToCleanup = [];
var dashboardsToCleanup = [];

function cleanupUsers(done) {
  if (usersToCleanup.length === 0) {
    return done();
  }
  var deletedCount = 0;
  var errorCount = 0;
  console.log('Cleaning up (Users)...');
  usersToCleanup.forEach(function (id) {
    users.remove(id, function (err, removed) {
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
  if (dashboardsToCleanup.length === 0) {
    return done();
  }
  var deletedCount = 0;
  var errorCount = 0;
  console.log('Cleaning up (Dashboards)...');
  dashboardsToCleanup.forEach(function (id) {
    dashboards.remove(id, function (err, removed) {
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

// TODO: Review this code and split it in different files
module.exports = {
  addUserToCleanup : function (id) {
    usersToCleanup.push(id);
  },
  addDashboardToCleanup : function (id) {
    dashboardsToCleanup.push(id);
  },
  createUser : function (cb) {
    var newUserId = 'test-user-' + uuid.v4();
    var newGoogleId = 'google-id-' + uuid.v4();
    usersToCleanup.push(newUserId);
    var newUser = {
      id: newUserId,
      //defaultProfile : {
      //  type : 'test',
      //  id : 1
      //},
      profiles: {
        google: [
          {
            id: newGoogleId,
            displayName: 'Test google profile',
            url: 'http://...',
            image: { url: 'http://...' }
          }
        ]
      }
    };
    users.add(newUser, function (err, createdUser) {
      cb(err, createdUser);
    });
  },
  newDashboardId : function () {
    var newDashboardId = 'test-dashboard-' + uuid.v4();
    dashboardsToCleanup.push(newDashboardId);
    return newDashboardId;
  },
  createDashboard : function () {
    return {
      id: this.newDashboardId(),
      code: randToken.generate(6),
      interval: 15,
      name: 'Test Dashboard',
      urls: [
        'http://citydashboard.org/london/',
        'http://www.casa.ucl.ac.uk/cumulus/ipad.html',
        'http://www.gridwatch.templar.co.uk/',
        'http://www.casa.ucl.ac.uk/weather/colours.html'
      ]
    }
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
  postEmptyDashboard : function (cb) {
    request.post('/dashboards')
      .send({ name : 'Test Dashboard - test-helpers.js' })
      .end(function (err, res) {
        if (err) {
          return cb(err);
        }
        cb(null, res.body);
      });
  },
  postAndPutDashboard : function (cb) {
    var _this = this;
    this.postEmptyDashboard(function (err, createdDashboard) {
      if (err) {
        return cb(err);
      }
      request.put('/dashboards/' + createdDashboard.id)
        .send(_this.getDashboardUpdate())
        .end(function (err, res) {
          if (err) {
            return cb(err);
          }
          cb(null, res.body);
        });
    });
  },
  postDashboardConnection : function (userId, code, cb) {
    tokens.create(userId, function (err, token) {
      if (err) { return done(err); }
      request.post('/users/' + userId + '/dashboards')
        .set('Authorization', 'Bearer ' + token)
        .send({ code : code })
        .end(function (err, res) {
          if (err) {
            return cb(err);
          }
          cb(null, res.body);
        });
    });
  },
  getDashboardCode : function (dashboardId, cb) {
    request.get('/dashboards/' + dashboardId + '/code')
      .end(function (err, res) {
        if (err) {
          return cb(err);
        }
        cb(null, res.body.code);
      });
  },
  cleanup : function (done) {
    cleanupUsers(function () {
      cleanupDashboards(done);
    });
  }
};

