(function () {
  'use strict';

  angular
    .module('feeds')
    .controller('FeedsController', FeedsController);

  FeedsController.$inject = ['$scope', 'feedResolve', 'Authentication'];

  function FeedsController($scope, feed, Authentication) {
    var vm = this;

    vm.feed = feed;
    vm.authentication = Authentication;
    vm.error = null;

  }
}());
