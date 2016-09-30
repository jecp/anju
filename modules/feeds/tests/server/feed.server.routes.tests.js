'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Feed = mongoose.model('Feed'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  feed;

/**
 * Feed routes tests
 */
describe('Feed CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new feed
    user.save(function () {
      feed = {
        title: 'Feed Title',
        content: 'Feed Content'
      };

      done();
    });
  });

  it('should not be able to save an feed if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/feeds')
          .send(feed)
          .expect(403)
          .end(function (feedSaveErr, feedSaveRes) {
            // Call the assertion callback
            done(feedSaveErr);
          });

      });
  });

  it('should not be able to save an feed if not logged in', function (done) {
    agent.post('/api/feeds')
      .send(feed)
      .expect(403)
      .end(function (feedSaveErr, feedSaveRes) {
        // Call the assertion callback
        done(feedSaveErr);
      });
  });

  it('should not be able to update an feed if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/feeds')
          .send(feed)
          .expect(403)
          .end(function (feedSaveErr, feedSaveRes) {
            // Call the assertion callback
            done(feedSaveErr);
          });
      });
  });

  it('should be able to get a list of feeds if not signed in', function (done) {
    // Create new feed model instance
    var feedObj = new Feed(feed);

    // Save the feed
    feedObj.save(function () {
      // Request feeds
      request(app).get('/api/feeds')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single feed if not signed in', function (done) {
    // Create new feed model instance
    var feedObj = new Feed(feed);

    // Save the feed
    feedObj.save(function () {
      request(app).get('/api/feeds/' + feedObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', feed.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single feed with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/feeds/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Feed is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single feed which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent feed
    request(app).get('/api/feeds/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No feed with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an feed if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/feeds')
          .send(feed)
          .expect(403)
          .end(function (feedSaveErr, feedSaveRes) {
            // Call the assertion callback
            done(feedSaveErr);
          });
      });
  });

  it('should not be able to delete an feed if not signed in', function (done) {
    // Set feed user
    feed.user = user;

    // Create new feed model instance
    var feedObj = new Feed(feed);

    // Save the feed
    feedObj.save(function () {
      // Try deleting feed
      request(app).delete('/api/feeds/' + feedObj._id)
        .expect(403)
        .end(function (feedDeleteErr, feedDeleteRes) {
          // Set message assertion
          (feedDeleteRes.body.message).should.match('User is not authorized');

          // Handle feed error error
          done(feedDeleteErr);
        });

    });
  });

  it('should be able to get a single feed that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new feed
          agent.post('/api/feeds')
            .send(feed)
            .expect(200)
            .end(function (feedSaveErr, feedSaveRes) {
              // Handle feed save error
              if (feedSaveErr) {
                return done(feedSaveErr);
              }

              // Set assertions on new feed
              (feedSaveRes.body.title).should.equal(feed.title);
              should.exist(feedSaveRes.body.user);
              should.equal(feedSaveRes.body.user._id, orphanId);

              // force the feed to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the feed
                    agent.get('/api/feeds/' + feedSaveRes.body._id)
                      .expect(200)
                      .end(function (feedInfoErr, feedInfoRes) {
                        // Handle feed error
                        if (feedInfoErr) {
                          return done(feedInfoErr);
                        }

                        // Set assertions
                        (feedInfoRes.body._id).should.equal(feedSaveRes.body._id);
                        (feedInfoRes.body.title).should.equal(feed.title);
                        should.equal(feedInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single feed if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new feed model instance
    var feedObj = new Feed(feed);

    // Save the feed
    feedObj.save(function () {
      request(app).get('/api/feeds/' + feedObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', feed.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single feed, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'feedowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Feed
    var _feedOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _feedOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Feed
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new feed
          agent.post('/api/feeds')
            .send(feed)
            .expect(200)
            .end(function (feedSaveErr, feedSaveRes) {
              // Handle feed save error
              if (feedSaveErr) {
                return done(feedSaveErr);
              }

              // Set assertions on new feed
              (feedSaveRes.body.title).should.equal(feed.title);
              should.exist(feedSaveRes.body.user);
              should.equal(feedSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the feed
                  agent.get('/api/feeds/' + feedSaveRes.body._id)
                    .expect(200)
                    .end(function (feedInfoErr, feedInfoRes) {
                      // Handle feed error
                      if (feedInfoErr) {
                        return done(feedInfoErr);
                      }

                      // Set assertions
                      (feedInfoRes.body._id).should.equal(feedSaveRes.body._id);
                      (feedInfoRes.body.title).should.equal(feed.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (feedInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Feed.remove().exec(done);
    });
  });
});
