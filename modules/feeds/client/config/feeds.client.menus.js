(function () {
  'use strict';

  angular
    .module('feeds')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: '文章列表',
      state: 'feeds',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'feeds', {
      title: '文章列表',
      state: 'feeds.list',
      roles: ['*']
    });
  }
}());
