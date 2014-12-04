'use strict';
var express = require('express');

var router = express.Router();
var app = express();

router.get('/status', function(req, res) {
  res.status(200);
  res.json({
    env: app.get('env')
  });
});

module.exports = router;
