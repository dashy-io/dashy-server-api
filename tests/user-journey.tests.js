//describe('Completes a full user journey', function (done) {
//  // create a dashboard like a raspberry pi
//  request.post('/dashboards')
//    .send({ id: uuid.v4() })
//    .expect(201)
//    .end(function(err, res) {
//      if (err) { return done(err); }
//      var dashboard = res.body;
//      // register a user
//      request.post('/user')
//        .send({ email: 'user@example.com' })
//        .expect(201)
//        .end(function (err, res) {
//          if (err) { return done(err); }
//          // get dashboard code
//          request.get('/dashboards/' + dashboard.id + '/code')
//            .expect(200)
//            .end(function (err, res) {
//              if (err) { return done(err); }
//              // connect a dashboard to user
//              // get user's dashboards
//              // edit a dashboard
//              // get a dashboard
//              // delete a dashboard
//              // delete a user
//              done();
//            });
//        });
//    });
//});
