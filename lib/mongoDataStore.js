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
      // ToDo: Return an error if ID not provided
      //if (!id) {
      //  return cb(new Error('DataStore error: ID not specified'));
      //}
      dashboards.findOne({ id : id }, function (err, dashboard) {
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, clone(dashboard));
      });
    },
    getDashboardByCode: function (code, cb) {
      // ToDo: Return an error if code not provided
      dashboards.findOne({ code: code }, function (err, dashboard) {
        if (err) { return cb(err); }
        if (dashboard) {
          delete dashboard._id;
        }
        return cb(null, clone(dashboard));
      });
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
    },
    updateDashboard: function (id, dashboard, cb) {
      // ToDo: Return an error if ID not provided
      dashboard = clone(dashboard);
      dashboards.update({ id: id }, { $set: dashboard }, function (err, res) {
        if (err) { return cb(err); }
        if (res === 1) {
          delete dashboard._id;
          return cb(null, clone(dashboard));
        } else {
          return cb(null, null);
        }
      });
    },
    deleteDashboard: function (id, cb) {
      // ToDo: Return an error if ID not provided
      dashboards.remove({ id: id }, function (err, res) {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    },
    getUser: function (id, cb) {
      // ToDo: Return an error if ID not provided
      //if (!id) {
      //  return cb(new Error('DataStore error: ID not specified'));
      //}
      users.findOne({ id : id }, function (err, user) {
        if (err) { return cb(err); }
        if (user) { delete user._id; }
        return cb(null, clone(user));
      });
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
    },
    updateUser: function (id, user, cb) {
      // ToDo: Return an error if ID not provided
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
    },
    deleteUser: function (id, cb) {
      // ToDo: Return an error if ID not provided
      users.remove({id: id}, function (err, res) {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    },
    getUserIdByGoogleUserId: function (googleUserId, cb) {
      // ToDo: Return an error if ID not provided
      users.findOne({'linkedProfiles.google.id': googleUserId}, function (err, user) {
        if (err) { return cb(err); }
        if (user) {
          delete user._id;
          return cb(null, user.id);
        } else {
          return cb(null, null);
        }
      });
    }
  }
};
