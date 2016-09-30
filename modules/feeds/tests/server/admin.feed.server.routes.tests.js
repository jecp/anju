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
describe('Feed Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an feed if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Get a list of feeds
            agent.get('/api/feeds')
              .end(function (feedsGetErr, feedsGetRes) {
                // Handle feed save error
                if (feedsGetErr) {
                  return done(feedsGetErr);
                }

                // Get feeds list
                var feeds = feedsGetRes.body;

                // Set assertions
                (feeds[0].user._id).should.equal(userId);
                (feeds[0].title).should.match('Feed Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an feed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Update feed title
            feed.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing feed
            agent.put('/api/feeds/' + feedSaveRes.body._id)
              .send(feed)
              .expect(200)
              .end(function (feedUpdateErr, feedUpdateRes) {
                // Handle feed update error
                if (feedUpdateErr) {
                  return done(feedUpdateErr);
                }

                // Set assertions
                (feedUpdateRes.body._id).should.equal(feedSaveRes.body._id);
                (feedUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an feed if no title is provided', function (done) {
    // Invalidate title field
    feed.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(400)
          .end(function (feedSaveErr, feedSaveRes) {
            // Set message assertion
            (feedSaveRes.body.message).should.match('Title cannot be blank');

            // Handle feed save error
            done(feedSaveErr);
          });
      });
  });

  it('should be able to delete an feed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Delete an existing feed
            agent.delete('/api/feeds/' + feedSaveRes.body._id)
              .send(feed)
              .expect(200)
              .end(function (feedDeleteErr, feedDeleteRes) {
                // Handle feed error error
                if (feedDeleteErr) {
                  return done(feedDeleteErr);
                }

                // Set assertions
                (feedDeleteRes.body._id).should.equal(feedSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single feed if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new feed model instance
    feed.user = user;
    var feedObj = new Feed(feed);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (feedInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
