'use strict';
var assert = require('chai').assert;
var parseDataStore = require('../lib/parseDataStore');

var testDashboard = {
  "id": "test-dashboard",
  "interval": 15,
  "name": "Test Dashboard",
  "urls": [
    "http://citydashboard.org/london/",
    "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
    "http://www.gridwatch.templar.co.uk/",
    "http://www.casa.ucl.ac.uk/weather/colours.html"
  ]
};

describe('Getting a dashboard', function () {
  it('returns a valid dashboard', function () {
    parseDataStore.getDashboard('test-dashboard', function(err, dashboard) {
      assert.deepEqual(dashboard, testDashboard);
    })
  });

  it('does not return a bad dashboard', function () {
    parseDataStore.getDashboard('test-dashboard-bad', function(err, dashboard) {
      assert.equals(dashboard, null);
    })
  });
});


