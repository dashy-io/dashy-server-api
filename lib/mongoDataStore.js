'use strict';
var MongoClient = require('mongodb').MongoClient;
var config = require('../config');

MongoClient.connect(config.mongoDbUrl, function(err, db) {
  console.log("Connected correctly to MongoDB server");

  db.close();
});

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

function mongoExecute(collectionName, operation, cb) {
  MongoClient.connect(config.mongoDbUrl, function(err, db) {
    if (err) { return cb(err); }
    var collection = db.collection(collectionName);
    operation(collection, function() {
      db.close();
    });
  });
}

function getDashboard(id, cb) {
  mongoExecute('dashboards', function (collection, done) {
    collection.findOne({ id : id }, function (err, dashboard) {
      done();
      if (err) { return cb(err); }
      if (dashboard) { delete dashboard._id; }
      return cb(null, clone(dashboard));
    });
  }, cb);
  //if (!id) {
  //  return cb(new Error('DataStore error: ID not specified'));
  //}
  //return cb(null, clone(cache.get(id)));
}

function getUser(id, cb) {
  mongoExecute('users', function (collection, done) {
    collection.findOne({ id : id }, function (err, user) {
      done();
      if (err) { return cb(err); }
      if (user) { delete user._id; }
      return cb(null, clone(user));
    });
  }, cb);

  //if (!id) {
  //  return cb(new Error('DataStore error: ID not specified'));
  //}
  //return cb(null, clone(cache.get(id)));
}

module.exports = {
  name : 'MongoDataStore',
  getDashboard : getDashboard,
  getDashboardByCode : function (code, cb) {
    mongoExecute('dashboards', function (collection, done) {
      collection.findOne({ code : code }, function (err, dashboard) {
        done();
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, clone(dashboard));
      });
    }, cb);

    //var id = cache.get(code);
    //getDashboard(id, function (err, dashboard) {
    //  return cb(null, clone(dashboard));
    //});
  },
  createDashboard : function (dashboard, cb) {
    mongoExecute('dashboards', function (collection, done) {
      dashboard = clone(dashboard);
      collection.insert(dashboard, function (err, res) {
        done();
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, clone(dashboard));
      });
    }, cb);

    //dashboard = clone(dashboard);
    //cache.put(dashboard.id, dashboard);
    //if (dashboard.code) {
    //  cache.put(dashboard.code, dashboard.id)
    //}
    //return cb(null, clone(dashboard));
  },
  updateDashboard : function (id, dashboard, cb) {
    mongoExecute('dashboards', function (collection, done) {
      dashboard = clone(dashboard);
      collection.update({ id : id }, { $set: dashboard }, function (err, res) {
        done();
        if (err) { return cb(err); }
        if (res === 1) {
          delete dashboard._id;
          return cb(null, clone(dashboard));
        } else {
          return cb(null, null);
        }
      });
    }, cb);

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
  deleteDashboard : function (id, cb) {
    mongoExecute('dashboards', function (collection, done) {
      collection.remove({ id : id }, function (err, res) {
        done();
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    }, cb);

    //getDashboard(id, function (err, dashboard) {
    //  if (!dashboard) {
    //    return cb(null, false);
    //  }
    //  cache.del(id);
    //  return cb(null, true);
    //});
  },
  getUser : getUser,
  createUser : function (user, cb) {
    mongoExecute('users', function (collection, done) {
      user = clone(user);
      collection.insert(user, function (err, res) {
        done();
        if (err) { return cb(err); }
        if (user) { delete user._id; }
        return cb(null, clone(user));
      });
    }, cb);

    //user = clone(user);
    //cache.put(user.id, user);
    //if (user.linkedProfiles && user.linkedProfiles.google) {
    //  var cacheKey = 'google-user-id:' + user.linkedProfiles.google.id;
    //}
    //cache.put(cacheKey, user.id);
    //return cb(null, clone(user));
  },
  updateUser : function (id, user, cb) {
    mongoExecute('users', function (collection, done) {
      user = clone(user);
      collection.update({ id : id }, { $set: user }, function (err, res) {
        done();
        if (err) { return cb(err); }
        if (res === 1) {
          delete user._id;
          return cb(null, clone(user));
        } else {
          return cb(null, null);
        }
      });
    }, cb);

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
  deleteUser : function (id, cb) {
    mongoExecute('users', function (collection, done) {
      collection.remove({ id : id }, function (err, res) {
        done();
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    }, cb);

    //getDashboard(id, function (err, user) {
    //  if (!user) {
    //    return cb(null, false);
    //  }
    //  cache.del(id);
    //  return cb(null, true);
    //});
  },
  getUserIdByGoogleUserId : function (googleUserId, cb) {
    mongoExecute('users', function (collection, done) {
      collection.findOne({ 'user.linkedProfiles.google.id' : googleUserId }, function (err, user) {
        done();
        if (err) { return cb(err); }
        if (user) { delete user._id; }
        return cb(null, clone(user));
      });
    }, cb);


    //var cacheKey = 'google-user-id:' + googleUserId;
    //return cb(null, cache.get(cacheKey));
  }
};
