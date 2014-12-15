'use strict';
var uuid = require('node-uuid');
var cleanup = require('./cleanup');
var usersToCleanup = [];

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
    cleanup.users(usersToCleanup, done);
  }
};

