'use strict';
var uuid = require('node-uuid');
var chai = require('chai');
var chaiString = require('chai-string');
var DataStore = require('../../lib/dataStore');
var testHelpers = require('../test-helpers');
var assert = chai.assert;
chai.use(chaiString);

after('DataStore Cleanup', function (done) {
  this.timeout(30000);
  testHelpers.cleanup(done);
});

describe('Getting a dashboard', function () {
  it('returns a valid dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
      dataStore.createDashboard(newDashboard, function (err) {
        if (err) { return done(err); }
        dataStore.getDashboard(newDashboard.id, function (err, dashboard) {
          if (err) { return done(err); }
          assert.deepEqual(dashboard, newDashboard);
          done();
        })
      });
    });
  });
  // TODO: Try get after create
  it('does not return a non-existing dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      dataStore.getDashboard('test-dashboard-bad', function (err, dashboard) {
        if (err) { return done(err); }
        assert.isNull(dashboard);
        done();
      });
    });
  });
  // TODO: Does not get a dashboard if id not specified
});

describe('Getting a dashboard by code', function () {
  it('returns a dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
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
});

describe('Creating a dashboard', function () {
  it('creates a new dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
      dataStore.createDashboard(newDashboard, function (err, createdDashboard) {
        if (err) { return done(err); }
        assert.deepEqual(createdDashboard, newDashboard);
        assert.startsWith(createdDashboard.id, 'test-dashboard-');
        done();
      });
    });
  });
  // TODO: Does not create a dashboard if id not specified
});

describe('Updating a dashboard', function () {
  it('updates a valid dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
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
  });
  // TODO: Try get after update
  it('persists additional fields', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
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
  });
  it('does not update a non-existing dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
      dataStore.updateDashboard(newDashboard.id, newDashboard, function (err, updatedDashboard) {
        if (err) { return done(err); }
        assert.isNull(updatedDashboard);
        done();
      });
    });
  });
  // TODO: Does not update a dashboard if id not specified
});

describe('Deleting a dashboard', function () {
  it('deletes a valid dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
      dataStore.createDashboard(newDashboard, function (err) {
        if (err) { return done(err); }
        dataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
          if (err) { return done(err); }
          assert.isTrue(deleted);
          done();
        });
      });
    });
  });
  // TODO: Try get after delete
  it('does not delete a non-existing dashboard', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newDashboard = testHelpers.createDashboard();
      dataStore.deleteDashboard(newDashboard.id, function (err, deleted) {
        if (err) { return done(err); }
        assert.isFalse(deleted);
        done();
      });
    });
  });
  // TODO: Does not delete a dashboard if id not specified
});

describe('Creating a user', function () {
  it('creates a new user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newUserId = 'test-user-' + uuid.v4();
      var newUser =  {
        id: newUserId
      };
      testHelpers.addUserToCleanup(newUserId);
      dataStore.createUser(newUser, function (err, createdUser) {
        if (err) { return done(err); }
        assert.deepEqual(createdUser, newUser);
        done();
      });
    });
  });
  // TODO: Try get after create
  // TODO: Does not create a user if id not specified
});

describe('Getting a user', function () {
  it('returns a valid user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, newUser) {
        if (err) { return done(err); }
        dataStore.getUser(newUser.id, function (err, user) {
          if (err) { return done(err); }
          assert.deepEqual(user, newUser);
          done();
        });
      });
    });
  });
  it('does not return a non-existing user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      dataStore.getUser('test-user-bad', function (err, user) {
        if (err) { return done(err); }
        assert.isNull(user);
        done();
      });
    });
  });
  // TODO: Does not get a user if id not specified
});

describe('Getting a user by Google User ID', function () {
  it('does not return a non existing user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      dataStore.getUserIdByGoogleUserId('bad-id', function (err, userId) {
        if (err) { return done(err); }
        assert.isNull(userId);
        done();
      });
    });
  });
  it('returns a valid user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, newUser) {
        if (err) { return done(err); }
        var googleUserId = newUser.profiles.google[0].id;
        dataStore.getUserIdByGoogleUserId(googleUserId, function (err, userId) {
          if (err) { return done(err); }
          assert.deepEqual(userId, newUser.id);
          done();
        });
      });
    });
  });
  // TODO: Does not get a user if Google user id not specified
});

describe('Updating a user', function () {
  it('updates a valid user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, newUser) {
        if (err) { return done(err); }
        newUser.name += ' EDITED';
        dataStore.updateUser(newUser.id, newUser, function (err, updatedUser) {
          if (err) { return done(err); }
          assert.deepEqual(updatedUser, newUser);
          done();
        });
      });
    });
  });
  // TODO: Try get after update
  it('persists additional fields', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, newUser) {
        if (err) { return done(err); }
        newUser.additional = 'additional field';
        dataStore.updateUser(newUser.id, newUser, function (err, updatedUser) {
          if (err) { return done(err); }
          dataStore.getUser(newUser.id, function (err, user) {
            if (err) { return done(err); }
            assert.equal(user.additional, 'additional field');
            assert.deepEqual(user, updatedUser);
            done();
          });
        });
      });
    });
  });
  it('does not update a non-existing user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      var newUserId = 'test-user-' + uuid.v4();
      var newUser =  {
        id: newUserId
      };
      testHelpers.addUserToCleanup(newUserId);
      dataStore.updateUser(newUser.id, newUser, function (err, updatedUser) {
        if (err) { return done(err); }
        assert.isNull(updatedUser);
        done();
      });
    });
  });
  // TODO: Does not update a user if id not specified
});

describe('Deleting a user', function () {
  it('deletes a valid user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      testHelpers.createUser(function (err, newUser) {
        if (err) { return done(err); }
        dataStore.deleteUser(newUser.id, function (err, deleted) {
          if (err) { return done(err); }
          assert.isTrue(deleted);
          done();
        });
      });
    });
  });
  // TODO: Try get after delete
  it('does not delete a non-existing user', function (done) {
    DataStore.create(function (err, dataStore) {
      if (err) { return done(err); }
      dataStore.deleteUser('test-user-' + uuid.v4(), function (err, deleted) {
        if (err) { return done(err); }
        assert.isFalse(deleted);
        done();
      });
    });
  });
  // TODO: Does not delete a user if id not specified
});
