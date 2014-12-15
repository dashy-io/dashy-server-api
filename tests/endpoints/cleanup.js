'use strict';
var dataStore = require('../../lib/dataStore').getDataStore();

module.exports = {
  users : function (usersToCleanup, done) {
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
};
