'use strict';
var cache = require('memory-cache');

function getDashboard(id, cb) {
  if (!id) {
    return cb(new Error('DataStore error: ID not specified'));
  }
  return cb(null, cache.get(id));
}

function createDashboard(dashboard, cb) {
  cache.put(dashboard.id, dashboard);
  return cb(null, dashboard);
}

function updateDashboard(id, dashboard, cb) {
  getDashboard(id, function (err, existingDashboard) {
    if (!existingDashboard) {
      return cb(null, null);
    }
    dashboard.id = existingDashboard.id;
    cache.put(id, dashboard);
    return cb(null, dashboard);
  });
}

function deleteDashboard(id, cb) {
  getDashboard(id, function (err, dashboard) {
    if (!dashboard) {
      return cb(null, false);
    }
    cache.del(id);
    return cb(null, true);
  });
}

module.exports = {
  name : 'InMemoryDataStore',
  getDashboard : getDashboard,
  createDashboard : createDashboard,
  updateDashboard : updateDashboard,
  deleteDashboard : deleteDashboard
};
