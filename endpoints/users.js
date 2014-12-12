'use strict';

var express = require('express');

var router = express.Router();
var app = express();

//case 'test-user':
//  user.name = 'Test User';
//  user.dashboards = [
//    'example-dashboard'
//  ];
//  break;
//case 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f':
//  user.name = 'TechHub User';
//  user.dashboards = [
//    'e6e02fd1-6ed3-45d3-b1a7-de4fe3d32906',
//    '9a173bac-a95c-4c89-95ef-3964c681f168'
//  ];
//  break;

router.post('/users', function (req, res, next) {
  var requiredProperties = ['email', 'name'];

  var badRequestError;
  requiredProperties.forEach(function (propertyName) {
    if (badRequestError) { return; }
    if (!req.body[propertyName]) {
      badRequestError = new Error('Property "' + propertyName + '" missing in body');
      badRequestError.status = 400;
    }
  });
  if (badRequestError) {
    return next(badRequestError);
  }
  res.status(201);
  res.json({});
});


module.exports = router;
