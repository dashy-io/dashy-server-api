'use strict';
var uuid = require('node-uuid');
var dataStore = require('../../lib/dataStore').getDataStore();
var usersToCleanup = [];

function cleanupUsers (usersToCleanup, done) {
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
  cleanup : function (done) {
    cleanupUsers(usersToCleanup, done);
  }
};

