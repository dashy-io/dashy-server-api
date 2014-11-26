var log = require('debug')('app');
var logError = require('debug')('app:error');
var app = require('express')();

logError.log = console.error.bind(console);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', require('./routes/api'));

app.use(function (req, res, next) {
  var err = new Error('Not found');
  err.status = 404;
  err.url = req.url;
  next(err);
});

app.use(function (err, req, res, next) {
  if (!(err instanceof Error)) {
    err = new Error(err);
  }
  var errorCode = err.status || 500;
  var errorResponse = {
    message: err.message
  };
  for (var propertyName in err) {
    if (err.hasOwnProperty(propertyName)) {
      errorResponse[propertyName] = err[propertyName];
    }
  }
  logError('Unhandled error: ' + errorCode);
  logError(errorResponse);
  res.status(errorCode);
  res.json(errorResponse);
});

module.exports = app;
