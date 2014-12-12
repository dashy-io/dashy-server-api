'use strict';
var uuid = require('node-uuid');
var express = require('express');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var dataStore = require('../lib/dataStore').getDataStore();
var router = express.Router();
var app = express();

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

router.post('/users', function (req, res, next) {
  var user = clone(req.body);
  var requiredProperties = ['email', 'name', 'dashboards'];
  var validationError = validator.requireProperties(user, requiredProperties);
  if (validationError) {
    return next(errorGenerator.missingProperty(validationError.missingProperty));
  }
  validationError = validator.allowProperties(user, requiredProperties);
  if (validationError) {
    return next(errorGenerator.unexpectedProperty(validationError.unexpectedProperty));
  }
  user.id = 'user-' + uuid.v4();
  dataStore.createUser(user, function (error, createdUser) {
    res.status(201);
    res.json(createdUser);
  });
});

module.exports = router;
