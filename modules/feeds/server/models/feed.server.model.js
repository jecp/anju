'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Feed Schema
 */
var FeedSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  // new
  updated: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    default: '',
    trim: true
  },
  tags: [{
    type: String
  }],
  author: {
    type: String
  },
  website: {
    type: String
  },
  link: {
    type: String
  },
  markdown: {
    type: String
  },
  pv: {
    type: Number,
    default: 0
  },
  like: {
    type: Number,
    default: 0
  },
  subcat: [{
    type: String
  }]
  /* // 分类待扩展
  category: {
    type: String
    ref: 'Category'
  }
  */

});

mongoose.model('Feed', FeedSchema);
