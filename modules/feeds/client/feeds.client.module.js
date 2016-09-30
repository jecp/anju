(function (app) {
  'use strict';

  app.registerModule('feeds', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('feeds.admin', ['core.admin']);
  app.registerModule('feeds.admin.routes', ['core.admin.routes']);
  app.registerModule('feeds.services');
  app.registerModule('feeds.routes', ['ui.router', 'core.routes', 'feeds.services']);
}(ApplicationConfiguration));
