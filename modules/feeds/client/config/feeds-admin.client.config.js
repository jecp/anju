(function () {
  'use strict';

  // Configuring the Feeds Admin module
  angular
    .module('feeds.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: '管理文章列表',
      state: 'admin.feeds.list'
    });
  }
}());
