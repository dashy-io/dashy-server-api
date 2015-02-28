'use strict';

var mongoDataStore = require('./mongoDataStore');

module.exports = {
  create : function create(cb) {
    cb(null, mongoDataStore)
  }
};
