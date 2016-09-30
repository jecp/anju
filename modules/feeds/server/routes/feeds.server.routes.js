'use strict';

/**
 * Module dependencies
 */
var feedsPolicy = require('../policies/feeds.server.policy'),
  feeds = require('../controllers/feeds.server.controller');

module.exports = function (app) {
  // Feeds collection routes
  app.route('/api/feeds').all(feedsPolicy.isAllowed)
    .get(feeds.list)
    .post(feeds.create);

  // Single feed routes
  app.route('/api/feeds/:feedId').all(feedsPolicy.isAllowed)
    .get(feeds.read)
    .put(feeds.update)
    .delete(feeds.delete);

  // fillContent
  app.route('/feedRss')
    .get(feeds.fillContent);

  // Finish by binding the feed middleware
  app.param('feedId', feeds.feedByID);
};
