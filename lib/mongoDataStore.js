'use strict';

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

module.exports = function (db) {
  return {
    name : 'MongoDataStore',
    get : function (selector, cb) {
      // TODO: Return an error if selector / filter not provided
      var collection = Object.keys(selector)[0];
      var filter = selector[collection];
      db.collection(collection).findOne(filter, function (err, dashboard) {
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, clone(dashboard));
      });
    },
    insert : function (selector, entity, cb) {
      // TODO: Return an error if selector
      var collection = Object.keys(selector)[0];
      entity = clone(entity);
      db.collection(collection).insert(entity, function (err, res) {
        if (err) { return cb(err); }
        if (entity) {
          delete entity._id;
        }
        return cb(null, entity);
      });
    },
    update : function (selector, entity, cb) {
      // TODO: Return an error if selector / filter not provided
      var collection = Object.keys(selector)[0];
      var filter = selector[collection];
      entity = clone(entity);
      db.collection(collection).update(filter, { $set : entity }, function (err, res) {
        if (err) { return cb(err); }
        if (res === 1) {
          delete entity._id;
          return cb(null, entity);
        } else {
          return cb(null, null);
        }
      });
    },
    delete : function (selector, cb) {
      var collection = Object.keys(selector)[0];
      var filter = selector[collection];
      // TODO: Return an error if selector / filter not provided
      db.collection(collection).remove(filter, function (err, res) {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    }
  };
};
