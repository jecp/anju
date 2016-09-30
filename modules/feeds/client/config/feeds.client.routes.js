(function () {
  'use strict';

  angular
    .module('feeds.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('feeds', {
        abstract: true,
        url: '/feeds',
        template: '<ui-view/>'
      })
      .state('feeds.list', {
        url: '',
        templateUrl: 'modules/feeds/client/views/index-feeds.client.view.html',
        controller: 'FeedsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Feeds List'
        }
      })
      .state('feeds.view', {
        url: '/:feedId',
        templateUrl: 'modules/feeds/client/views/view-feed.client.view.html',
        controller: 'FeedsController',
        controllerAs: 'vm',
        resolve: {
          feedResolve: getFeed
        },
        data: {
          pageTitle: 'Feed {{ feedResolve.title }}'
        }
      });
  }

  getFeed.$inject = ['$stateParams', 'FeedsService'];

  function getFeed($stateParams, FeedsService) {
    return FeedsService.get({
      feedId: $stateParams.feedId
    }).$promise;
  }
}());
