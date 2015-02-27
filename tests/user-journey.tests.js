'use strict';
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');
var app = require('../app');
var testHelpers = require('./test-helpers');
var assert = chai.assert;
request = request(app);
chai.use(chaiString);

describe('User Journey', function () {
  this.timeout(20000);
  it('Completes a full user journey', function (done) {
    request.post('/dashboards')
      .send({ name : 'Test Dashboard - user-journey.tests.js' })
      .expect(201)
      .end(function (err, res) {
        if (err) { return done(err); }
        var dashboard = res.body;
        // register a user
        testHelpers.createUser(function (err, user) {
          if (err) { return done(err); }
          // get dashboard code
          request.get('/dashboards/' + dashboard.id + '/code')
            .expect(200)
            .end(function (err, res) {
              if (err) { return done(err); }
              var dashboardCode = res.body.code;
              // connect a dashboard to user
              request.post('/users/' + user.id + '/dashboards')
                .send({code: dashboardCode})
                .expect(201)
                .end(function (err, res) {
                  if (err) { return done(err); }
                  // get user's dashboards
                  request.get('/users/' + user.id)
                    .expect(200)
                    .end(function (err, res) {
                      if (err) { return done(err); }
                      user = res.body;
                      assert.deepEqual(user.dashboards, [ dashboard.id ]);
                      dashboard.name = 'Test dashboard for user journey';
                      // edit a dashboard
                      request.put('/dashboards/' + dashboard.id)
                        .send(dashboard)
                        .expect(200)
                        .expect(dashboard)
                        .end(function (err, res) {
                          if (err) { return done(err); }
                          // delete a dashboard
                          request.delete('/dashboards/' + dashboard.id)
                            .expect(204)
                            .end(function (err, res) {
                              if (err) { return done(err); }
                              // delete a user
                              request.delete('/users/' + user.id)
                                .expect(204)
                                .end(done);
                            });
                        });
                    });
                });
            });
        });
      });
  });
});
