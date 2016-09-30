(function () {
  'use strict';

  describe('Feeds Route Tests', function () {
    // Initialize global variables
    var $scope,
      FeedsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FeedsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FeedsService = _FeedsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('feeds');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/feeds');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('feeds.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('modules/feeds/client/views/list-feeds.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          FeedsController,
          mockFeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('feeds.view');
          $templateCache.put('modules/feeds/client/views/view-feed.client.view.html', '');

          // create mock feed
          mockFeed = new FeedsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Feed about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          FeedsController = $controller('FeedsController as vm', {
            $scope: $scope,
            feedResolve: mockFeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:feedId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.feedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            feedId: 1
          })).toEqual('/feeds/1');
        }));

        it('should attach an feed to the controller scope', function () {
          expect($scope.vm.feed._id).toBe(mockFeed._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/feeds/client/views/view-feed.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('feeds.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('feeds/');
          $rootScope.$digest();

          expect($location.path()).toBe('/feeds');
          expect($state.current.templateUrl).toBe('modules/feeds/client/views/list-feeds.client.view.html');
        }));
      });
    });
  });
}());
