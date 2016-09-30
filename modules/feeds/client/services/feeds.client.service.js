(function () {
  'use strict';

  angular
    .module('feeds.services')
    .factory('FeedsService', FeedsService);

  FeedsService.$inject = ['$resource'];

  function FeedsService($resource) {
    var Feed = $resource('api/feeds/:feedId', {
      feedId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Feed.prototype, {
      createOrUpdate: function () {
        var feed = this;
        return createOrUpdate(feed);
      }
    });

    return Feed;

    function createOrUpdate(feed) {
      if (feed._id) {
        return feed.$update(onSuccess, onError);
      } else {
        return feed.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(feed) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      console.log(error);
    }
  }
}());
