'use strict';
var request = require('supertest');
var chai = require('chai');
var chaiString = require('chai-string');
var app = require('../app');
var testHelpers = require('./test-helpers');
var tokens = require('../lib/tokens');
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
          tokens.create(user.id, function (err, token) {
            if (err) { return done(err); }
            // get dashboard code
            request.get('/dashboards/' + dashboard.id + '/code')
              .expect(200)
              .end(function (err, res) {
                if (err) { return done(err); }
                var dashboardCode = res.body.code;
                // connect a dashboard to user
                request.post('/users/' + user.id + '/dashboards')
                  .set('Authorization', 'Bearer ' + token)
                  .send({code: dashboardCode})
                  .expect(201)
                  .end(function (err, res) {
                    if (err) { return done(err); }
                    
                    dashboard.name = 'Test dashboard for user journey';
                    // edit a dashboard
                    request.put('/dashboards/' + dashboard.id)
                      .set('Authorization', 'Bearer ' + token)
                      .send(dashboard)
                      .expect(200)
                      .expect(dashboard)
                      .end(function (err, res) {
                        if (err) { return done(err); }
                        // delete a dashboard
                        request.delete('/dashboards/' + dashboard.id)
                          .set('Authorization', 'Bearer ' + token)
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
