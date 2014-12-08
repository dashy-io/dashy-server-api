'use strict';
var express = require('express');
var config = require('../config');
var dataStore = require('../lib/dataStore').getDataStore();

var router = express.Router();

router.get('/status', function(req, res) {
  res.status(200);
  res.json({
    env : config.env,
    dataStore : dataStore.name
  });
});

module.exports = router;
