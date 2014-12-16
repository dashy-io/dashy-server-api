'use strict';
var uuid = require('node-uuid');
var chai = require('chai');
var chaiString = require('chai-string');
var randToken = require('rand-token');
var dataStore = require('../../lib/dataStore').getDataStore();
var assert = chai.assert;
chai.use(chaiString);

var dashboardsToCleanup = [];
var usersToCleanup = [];

function createDashboard() {
  var newId = 'test-dashboard-' + uuid.v4();
  dashboardsToCleanup.push(newId);
  return {
    id: newId,
    code: randToken.generate(8),
    interval: 15,
    name: 'Test Dashboard',
    urls: [
      'http://citydashboard.org/london/',
      'http://www.casa.ucl.ac.uk/cumulus/ipad.html',
      'http://www.gridwatch.templar.co.uk/',
      'http://www.casa.ucl.ac.uk/weather/colours.html'
    ]
  }
}

function createUser() {
  var newId = 'test-user-' + uuid.v4();
  usersToCleanup.push(newId);
  return {
    id : newId,
    name : 'User Name',
    email : newId + '@example.com'
  }
}

after('DataStore Cleanup', function (done) {
  if (dashboardsToCleanup.length === 0) {
    return done();
  }
  this.timeout(30000);
  var deletedCount = 0;
  console.log('Cleaning up (DataStore)...');
  dashboardsToCleanup.forEach(function (id) {
    dataStore.deleteDashboard(id, function (err) {
      if (err) { console.log(err); }
      deletedCount++;
      if (deletedCount === dashboardsToCleanup.length + usersToCleanup.length) {
        console.log('Done.');
        return done();
      }
    });
  });
  usersToCleanup.forEach(function (id) {
    dataStore.deleteUser(id, function (err) {
      if (err) { console.log(err); }
      deletedCount++;
      if (deletedCount === dashboardsToCleanup.length + usersToCleanup.length) {
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
      dataStore.getDashboard(newDashboard.id, function (err, dashboard) {
        if (err) { return done(err); }
        assert.deepEqual(dashboard, newDashboard);
        done();
      })
    });
  });
  it('does not return a non-existing dashboard', function (done) {
    dataStore.getDashboard('test-dashboard-bad', function (err, dashboard) {
      if (err) { return done(err); }
      assert.isNull(dashboard);
      done();
    })
  });
  // TODO: Does not get a dashboard if id not specified
});

describe('Getting a dashboard by code', function () {
  it('returns a dashboard', function (done) {
    var newDashboard = createDashboard();
    dataStore.createDashboard(newDashboard, function (err) {
      if (err) { return done(err); }
      dataStore.getDashboardByCode(newDashboard.code, function (err, dashboard) {
        if (err) { return done(err); }
        assert.deepEqual(dashboard, newDashboard);
        done();
      })
    });
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
  // TODO: Does not create a dashboard if id not specified
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
  // TODO: Does not update a dashboard if id not specified
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
  // TODO: Does not delete a dashboard if id not specified
});

describe('Creating a user', function () {
  it('creates a new user', function (done) {
    var newUser = createUser();
    dataStore.createUser(newUser, function (err, createdUser) {
      if (err) { return done(err); }
      assert.deepEqual(createdUser, newUser);
      done();
    });
  });
  // TODO: Does not create a user if id not specified
});

describe('Getting a user', function () {
  it('returns a valid user', function (done) {
    var newUser = createUser();
    dataStore.createUser(newUser, function (err) {
      if (err) { return done(err); }
      dataStore.getUser(newUser.id, function (err, user) {
        if (err) { return done(err); }
        assert.deepEqual(user, newUser);
        done();
      })
    });
  });
  it('does not return a non-existing user', function (done) {
    dataStore.getUser('test-user-bad', function (err, user) {
      if (err) { return done(err); }
      assert.isNull(user);
      done();
    })
  });
  // TODO: Does not get a user if id not specified
});

describe('Updating a user', function () {
  it('updates a valid user', function (done) {
    var newUser = createUser();
    dataStore.createUser(newUser, function (err, createdUser) {
      if (err) { return done(err); }
      createdUser.name += ' EDITED';
      dataStore.updateUser(createdUser.id, createdUser, function (err, updatedUser) {
        if (err) { return done(err); }
        assert.deepEqual(updatedUser, createdUser);
        done();
      });
    });
  });
  it('persists additional fields', function (done) {
    var newUser = createUser();
    newUser.additional1 = 'additional field 1';
    dataStore.createUser(newUser, function (err, createdUser) {
      if (err) { return done(err); }
      createdUser.additional2 = 'additional field 2';
      dataStore.updateUser(createdUser.id, createdUser, function (err, updatedUser) {
        if (err) { return done(err); }
        dataStore.getUser(createdUser.id, function (err, user) {
          if (err) { return done(err); }
          assert.equal(user.additional1, 'additional field 1');
          assert.equal(user.additional2, 'additional field 2');
          assert.deepEqual(user, updatedUser);
          done();
        });
      });
    });
  });
  it('does not update a non-existing user', function (done) {
    var newUser = createUser();
    dataStore.updateUser(newUser.id, newUser, function (err, updatedUser) {
      if (err) { return done(err); }
      assert.isNull(updatedUser);
      done();
    });
  });
  // TODO: Does not update a user if id not specified
});

describe('Deleting a user', function () {
  it('deletes a valid user', function (done) {
    var newUser = createUser();
    dataStore.createUser(newUser, function (err) {
      if (err) { return done(err); }
      dataStore.deleteUser(newUser.id, function (err, deleted) {
        if (err) { return done(err); }
        assert.isTrue(deleted);
        done();
      });
    });
  });
  it('does not delete a non-existing dashboard', function (done) {
    var newUser = createUser();
    dataStore.deleteUser(newUser.id, function (err, deleted) {
      if (err) { return done(err); }
      assert.isFalse(deleted);
      done();
    });
  });
  // TODO: Does not delete a user if id not specified
});
