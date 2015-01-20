'use strict';

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

module.exports = function (db) {
  var dashboards = db.collection('dashboards');
  var users = db.collection('users');
  return {
    name: 'MongoDataStore',
    getDashboard: function (id, cb) {
      dashboards.findOne({ id : id }, function (err, dashboard) {
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, clone(dashboard));
      });

      //if (!id) {
      //  return cb(new Error('DataStore error: ID not specified'));
      //}
      //return cb(null, clone(cache.get(id)));
    },
    getDashboardByCode: function (code, cb) {
      dashboards.findOne({code: code}, function (err, dashboard) {
        if (err) { return cb(err); }
        if (dashboard) {
          delete dashboard._id;
        }
        return cb(null, clone(dashboard));
      });

      //var id = cache.get(code);
      //getDashboard(id, function (err, dashboard) {
      //  return cb(null, clone(dashboard));
      //});
    },
    createDashboard: function (dashboard, cb) {
      dashboard = clone(dashboard);
      dashboards.insert(dashboard, function (err, res) {
        if (err) { return cb(err); }
        if (dashboard) {
          delete dashboard._id;
        }
        return cb(null, clone(dashboard));
      });

      //dashboard = clone(dashboard);
      //cache.put(dashboard.id, dashboard);
      //if (dashboard.code) {
      //  cache.put(dashboard.code, dashboard.id)
      //}
      //return cb(null, clone(dashboard));
    },
    updateDashboard: function (id, dashboard, cb) {
      dashboard = clone(dashboard);
      dashboards.update({id: id}, {$set: dashboard}, function (err, res) {
        if (err) { return cb(err); }
        if (res === 1) {
          delete dashboard._id;
          return cb(null, clone(dashboard));
        } else {
          return cb(null, null);
        }
      });

      //getDashboard(id, function (err, existingDashboard) {
      //  if (!existingDashboard) {
      //    return cb(null, null);
      //  }
      //  dashboard = clone(dashboard);
      //  dashboard.id = existingDashboard.id;
      //  cache.put(id, dashboard);
      //  return cb(null, clone(dashboard));
      //});
    },
    deleteDashboard: function (id, cb) {
      dashboards.remove({id: id}, function (err, res) {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });

      //getDashboard(id, function (err, dashboard) {
      //  if (!dashboard) {
      //    return cb(null, false);
      //  }
      //  cache.del(id);
      //  return cb(null, true);
      //});
    },
    getUser: function (id, cb) {
      users.findOne({ id : id }, function (err, user) {
        if (err) { return cb(err); }
        if (user) { delete user._id; }
        return cb(null, clone(user));
      });

      //if (!id) {
      //  return cb(new Error('DataStore error: ID not specified'));
      //}
      //return cb(null, clone(cache.get(id)));
    },
    createUser: function (user, cb) {
      user = clone(user);
      users.insert(user, function (err, res) {
        if (err) { return cb(err); }
        if (user) {
          delete user._id;
        }
        return cb(null, clone(user));
      });

      //user = clone(user);
      //cache.put(user.id, user);
      //if (user.linkedProfiles && user.linkedProfiles.google) {
      //  var cacheKey = 'google-user-id:' + user.linkedProfiles.google.id;
      //}
      //cache.put(cacheKey, user.id);
      //return cb(null, clone(user));
    },
    updateUser: function (id, user, cb) {
      user = clone(user);
      users.update({id: id}, {$set: user}, function (err, res) {
        if (err) { return cb(err); }
        if (res === 1) {
          delete user._id;
          return cb(null, clone(user));
        } else {
          return cb(null, null);
        }
      });

      //getDashboard(id, function (err, existingUser) {
      //  if (!existingUser) {
      //    return cb(null, null);
      //  }
      //  user = clone(user);
      //  user.id = existingUser.id;
      //  cache.put(id, user);
      //  return cb(null, clone(user));
      //});
    },
    deleteUser: function (id, cb) {
      users.remove({id: id}, function (err, res) {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });

      //getDashboard(id, function (err, user) {
      //  if (!user) {
      //    return cb(null, false);
      //  }
      //  cache.del(id);
      //  return cb(null, true);
      //});
    },
    getUserIdByGoogleUserId: function (googleUserId, cb) {
      users.findOne({'linkedProfiles.google.id': googleUserId}, function (err, user) {
        if (err) { return cb(err); }
        if (user) {
          delete user._id;
          return cb(null, user.id);
        } else {
          return cb(null, null);
        }
      });

      //var cacheKey = 'google-user-id:' + googleUserId;
      //return cb(null, cache.get(cacheKey));
    }
  }
};
