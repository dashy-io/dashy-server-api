'use strict';

var express = require('express');

var router = express.Router();
var app = express();

router.get('/users/:id', function (req, res, next) {
  var id = req.params.id;
  var user = {
    id : id
  };
  switch (id) {
    case 'test-user':
      user.name = 'Test User';
      user.dashboards = [
        'example-dashboard'
      ];
      break;
    case 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f':
      user.name = 'TechHub User';
      user.dashboards = [
        'e6e02fd1-6ed3-45d3-b1a7-de4fe3d32906',
        '9a173bac-a95c-4c89-95ef-3964c681f168'
      ];
      break;
    default:
      var notFoundError = new Error('User Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
  }
  res.status(200);
  res.json(user);
});

module.exports = router;
