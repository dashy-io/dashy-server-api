var express = require('express');

var router = express.Router();
var app = express();

router.get('/status', function(req, res) {
  res.status(200);
  res.json({
    env: app.get('env')
  });
});

router.get('/dashboard/:id', function(req, res, next) {
  var id = req.params.id;
  var dashboard = {
    interval: 60
  };
  switch (id) {
    case 'test':
      dashboard.interval = 15;
      dashboard.urls = [
        'http://citydashboard.org/london/',
        'http://www.casa.ucl.ac.uk/cumulus/ipad.html',
        'http://www.gridwatch.templar.co.uk/',
        'http://www.casa.ucl.ac.uk/weather/colours.html'
      ];
      break;
    case 'e6e02fd1-6ed3-45d3-b1a7-de4fe3d32906':
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

module.exports = router;
