var express = require('express');
var dataStore = require('../lib/parseDataStore');

var router = express.Router();
var app = express();

router.get('/status', function(req, res) {
  res.status(200);
  res.json({
    env: app.get('env')
  });
});

router.get('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.getDashboard(id, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
    }
    res.status(200);
    res.json(dashboard);
  });
});

router.put('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.updateDashboard(id, req.body, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    res.status(200);
    res.json(dashboard);
  });
});

router.post('/dashboards', function (req, res, next) {
  dataStore.createDashboard(req.body, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    res.status(201);
    res.json(dashboard);
  });
});

router.delete('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.deleteDashboard(id, function(err, deleted) {
    if (err) {
      next(err);
      return;
    }
    if (!deleted) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
    }
    res.status(204);
    res.end();
  });
});

router.get('/users/:id', function (req, res, next) {
  var id = req.params.id;
  var user = {
    id : id
  };
  switch (id) {
    case 'test-user':
      user.name = 'Test User';
      user.dashboards = [
        'test-dashboard'
      ];
      break;
    case 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f':
      user.name = 'TechHub User';
      user.dashboards = [
        'e6e02fd1-6ed3-45d3-b1a7-de4fe3d32906'
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
