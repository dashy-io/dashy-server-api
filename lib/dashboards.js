'use strict';
let DataStore = require('../lib/mongoDataStore');

module.exports = {
  add: (dashboard, cb) => {
    DataStore.insert({ dashboards: null }, dashboard, cb);
  },
  get: (id, cb) => {
    DataStore.get({ dashboards: { id: id } }, cb);
  },
  getByCode: (code, cb) => {
    DataStore.get({ dashboards: { code: code }}, cb);
  },
  update: (dashboard, cb) => {
    DataStore.update({ dashboards: { id: dashboard.id }}, dashboard, cb);
  },
  remove: (id, cb) =>
    DataStore.delete({ dashboards: { id: id }}, cb),
  removeCode: (id, cb) =>
    DataStore.update({ dashboards: { id: id }}, { code: null }, cb)
};
