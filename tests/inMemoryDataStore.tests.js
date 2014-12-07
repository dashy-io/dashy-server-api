'use strict';
var inMemoryDataStore = require('../lib/inMemoryDataStore');
var dataStoreTests = require('./dataStore.base-tests');

dataStoreTests(inMemoryDataStore);
