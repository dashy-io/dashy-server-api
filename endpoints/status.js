'use strict';
var express = require('express');
var config = require('../config');

var router = express.Router();

router.get('/status', function(req, res) {
  res.status(200);
  res.json({
    env : config.env
  });
});

module.exports = router;
