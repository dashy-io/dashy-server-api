'use strict';
let DataStore = require('../lib/mongoDataStore');

module.exports = {
  add: (user, cb) =>
    DataStore.insert({ users: null }, user, cb),
  get: (id, cb) =>
    DataStore.get({ users: { id: id }}, cb),
  getByGoogleId: (googleId, cb) =>
    DataStore.get({ users: { 'profiles.google.id': googleId }}, cb),
  update: (user, cb) =>
    DataStore.update({ users: { id: user.id }}, user, cb),
  remove: (id, cb) =>
    DataStore.delete({ users: { id: id }}, cb)
};
