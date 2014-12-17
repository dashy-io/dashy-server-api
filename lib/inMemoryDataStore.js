'use strict';
var cache = require('memory-cache');

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

function getDashboard(id, cb) {
  if (!id) {
    return cb(new Error('DataStore error: ID not specified'));
  }
  return cb(null, clone(cache.get(id)));
}

function getUser(id, cb) {
  if (!id) {
    return cb(new Error('DataStore error: ID not specified'));
  }
  return cb(null, clone(cache.get(id)));
}

module.exports = {
  name : 'InMemoryDataStore',
  getDashboard : getDashboard,
  getDashboardByCode : function (code, cb) {
    var id = cache.get(code);
    getDashboard(id, function (err, dashboard) {
      return cb(null, clone(dashboard));
    });
  },
  createDashboard : function (dashboard, cb) {
    dashboard = clone(dashboard);
    cache.put(dashboard.id, dashboard);
    if (dashboard.code) {
      cache.put(dashboard.code, dashboard.id)
    }
    return cb(null, clone(dashboard));
  },
  updateDashboard : function (id, dashboard, cb) {
    getDashboard(id, function (err, existingDashboard) {
      if (!existingDashboard) {
        return cb(null, null);
      }
      dashboard = clone(dashboard);
      dashboard.id = existingDashboard.id;
      cache.put(id, dashboard);
      return cb(null, clone(dashboard));
    });
  },
  deleteDashboard : function (id, cb) {
    getDashboard(id, function (err, dashboard) {
      if (!dashboard) {
        return cb(null, false);
      }
      cache.del(id);
      return cb(null, true);
    });
  },
  getUser : getUser,
  createUser : function (user, cb) {
    user = clone(user);
    cache.put(user.id, user);
    if (user.linkedProfiles && user.linkedProfiles.google) {
      var cacheKey = 'google-user-id:' + user.linkedProfiles.google.id;
    }
    cache.put(cacheKey, user.id);
    return cb(null, clone(user));
  },
  updateUser : function (id, user, cb) {
    getDashboard(id, function (err, existingUser) {
      if (!existingUser) {
        return cb(null, null);
      }
      user = clone(user);
      user.id = existingUser.id;
      cache.put(id, user);
      return cb(null, clone(user));
    });
  },
  deleteUser : function (id, cb) {
    getDashboard(id, function (err, user) {
      if (!user) {
        return cb(null, false);
      }
      cache.del(id);
      return cb(null, true);
    });
  },
  getUserIdByGoogleUserId : function (googleUserId, cb) {
    var cacheKey = 'google-user-id:' + googleUserId;
    return cb(null, cache.get(cacheKey));
  }
};
