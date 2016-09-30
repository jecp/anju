'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Feed = mongoose.model('Feed'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  cheerio = require('cheerio'),
  http = require('http'),
  request = require('request');

/**
 * 调用网页内容，传输给前端
*/
exports.fillContent = function (req, res) {
  console.log(req);
  request.get(req.body.link, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('1111:' + body.xml);
      console.log('2222:' + body.html);
    }
    console.log(body);
    feed.content = body;
    var c = cheerio.load(body);
    // console.log(body);
    console.log('\n c is :' + c);
  });
  /* var a = download(req.body.link);
  console.log(a);
  var b = cheerio.load(a);
  console.log(b); */
  res.send(body);
}

/**
 * 调取输入的网址，抓取内容
*/
/*
function download(url, callback) {
  console.log('1111' + url);
  http.get(url, function(res) {
    // console.log(res);
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function() {
      callback(data);
    });
  }).on('error', function() {
    callback(null);
  });
}
*/


/**
 * Create an feed
 */
exports.create = function (req, res) {
  var feed = new Feed(req.body);
  feed.user = req.user;
  console.log(req.body.link);
  request.get(req.body.link, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('1111:' + body.xml);
      console.log('2222:' + body.html);
    }
    console.log(body);
    feed.content = body;
    var c = cheerio.load(body);
    // console.log(body);
    console.log('\n c is :' + c);
  });
  /* var a = download(req.body.link);
  console.log(a);
  var b = cheerio.load(a);
  console.log(b); */

  feed.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feed);
    }
  });
};

/**
 * Show the current feed
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var feed = req.feed ? req.feed.toJSON() : {};

  // Add a custom field to the Feed, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Feed model.
  feed.isCurrentUserOwner = !!(req.user && feed.user && feed.user._id.toString() === req.user._id.toString());

  res.json(feed);
};

/**
 * Update an feed
 */
exports.update = function (req, res) {
  var feed = req.feed;

  feed.title = req.body.title;
  feed.content = req.body.content;

  feed.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feed);
    }
  });
};

/**
 * Delete an feed
 */
exports.delete = function (req, res) {
  var feed = req.feed;

  feed.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feed);
    }
  });
};

/**
 * List of Feeds
 */
exports.list = function (req, res) {
  Feed.find().sort('-created').populate('user', 'displayName').exec(function (err, feeds) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feeds);
    }
  });
};

/**
 * Feed middleware
 */
exports.feedByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Feed is invalid'
    });
  }

  Feed.findById(id).populate('user', 'displayName').exec(function (err, feed) {
    if (err) {
      return next(err);
    } else if (!feed) {
      return res.status(404).send({
        message: 'No feed with that identifier has been found'
      });
    }
    req.feed = feed;
    next();
  });
};
