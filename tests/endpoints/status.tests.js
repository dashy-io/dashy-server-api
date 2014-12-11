'use strict';

var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');

var app = require('../../app');
var config = require('../../config');
request = request(app);
chai.use(chaiString);

describe('GET ~/status', function () {
  it('returns 200 OK and the environment', function (done) {
    request.get('/status')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      .expect('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      .expect({
        env : config.env,
        dataStore : config.env === 'test' ? 'InMemoryDataStore' : 'ParseDataStore'
      })
      .end(done);
  });
});
