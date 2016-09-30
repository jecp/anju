(function () {
  'use strict';

  angular
    .module('feeds.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.feeds', {
        abstract: true,
        url: '/feeds',
        template: '<ui-view/>'
      })
      .state('admin.feeds.list', {
        url: '',
        templateUrl: 'modules/feeds/client/views/admin/list-feeds.client.view.html',
        controller: 'FeedsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.feeds.create', {
        url: '/create',
        templateUrl: 'modules/feeds/client/views/admin/form-feed.client.view.html',
        controller: 'FeedsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          feedResolve: newFeed
        }
      })
      .state('admin.feeds.edit', {
        url: '/:feedId/edit',
        templateUrl: 'modules/feeds/client/views/admin/form-feed.client.view.html',
        controller: 'FeedsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          feedResolve: getFeed
        }
      });
  }

  getFeed.$inject = ['$stateParams', 'FeedsService'];

  function getFeed($stateParams, FeedsService) {
    return FeedsService.get({
      feedId: $stateParams.feedId
    }).$promise;
  }

  newFeed.$inject = ['FeedsService'];

  function newFeed(FeedsService) {
    return new FeedsService();
  }
}());
