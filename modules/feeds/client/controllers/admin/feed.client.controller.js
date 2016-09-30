(function () {
  'use strict';

  angular
    .module('feeds.admin')
    .controller('FeedsAdminController', FeedsAdminController);

  FeedsAdminController.$inject = ['$scope', '$state', '$window', 'feedResolve', 'Authentication'];

  function FeedsAdminController($scope, $state, $window, feed, Authentication) {
    var vm = this;

    vm.feed = feed;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Feed
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.feed.$remove($state.go('admin.feeds.list'));
      }
    }

  // auto fill the content
  function fillContent() {
    var link = feed.link;
    vm.feed.content = null;
    $http.get('/feedRss?=' + link).success(function (response){
        if(response){
          $scope.success = '查询成功';
          $scope.content = response;
        }else{
          $scope.success = '未查到信息';
        }
      });   

  }

    // Save Feed
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.feedForm');
        return false;
      }

      // Create a new feed, or update the current instance
      vm.feed.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.feeds.list'); // should we send the User to the list or the updated Feed's view?
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
