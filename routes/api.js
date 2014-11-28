var express = require('express');

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
  var dashboard = {
    interval : 60
  };
  switch (id) {
    case 'test':
      dashboard.name = 'Test Dashboard';
      dashboard.interval = 15;
      dashboard.urls = [
        'http://citydashboard.org/london/',
        'http://www.casa.ucl.ac.uk/cumulus/ipad.html',
        'http://www.gridwatch.templar.co.uk/',
        'http://www.casa.ucl.ac.uk/weather/colours.html'
      ];
      break;
    case 'e6e02fd1-6ed3-45d3-b1a7-de4fe3d32906':
      dashboard.name = 'TechHub';
      dashboard.urls = [
        'http://s3-eu-west-1.amazonaws.com/mattia.test/community-messages/index.html',
        'http://s3-eu-west-1.amazonaws.com/mattia.test/flex_desks/1FlexShow.html'
      ];
      break;
    default:
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
  }
  res.status(200);
  res.json(dashboard);
});

router.put('/dashboards/:id', function(req, res, next) {
  res.status(200);
  res.json(req.body);
});

router.get('/users/:id', function(req, res, next) {
  var id = req.params.id;
  var user = {
    id : id
  };
  switch (id) {
    case 'test-user':
      user.name = 'Test User';
      user.dashboards = [
        'test'
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
