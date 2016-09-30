(function () {
  'use strict';

  angular
    .module('feeds.admin')
    .controller('FeedsAdminListController', FeedsAdminListController);

  FeedsAdminListController.$inject = ['FeedsService'];

  function FeedsAdminListController(FeedsService) {
    var vm = this;

    vm.feeds = FeedsService.query();
  }
}());
