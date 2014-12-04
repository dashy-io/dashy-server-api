'use strict';

var log = require('debug')('app');
var logError = require('debug')('app:error');
var app = require('express')();
var bodyParser = require('body-parser');

logError.log = console.error.bind(console);

app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use('/', require('./endpoints/status'));
app.use('/', require('./endpoints/dashboards'));
app.use('/', require('./endpoints/users'));

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  err.url = req.url;
  next(err);
});

app.use(function (err, req, res, next) {
  if (!(err instanceof Error)) {
    err = new Error(err);
  }
  var errorCode = err.status || 500;
  var allow = err.allow || '';
  var errorResponse = {
    message: err.message
  };
  for (var propertyName in err) {
    if (err.hasOwnProperty(propertyName)) {
      if (propertyName === 'status') {
        continue;
      }
      errorResponse[propertyName] = err[propertyName];
    }
  }
  logError('Unhandled error: ' + errorCode);
  logError(errorResponse);
  res.status(errorCode);
  res.header('Allow', allow);
  res.json(errorResponse);
});

module.exports = app;
