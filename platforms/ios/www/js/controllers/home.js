angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $cordovaLocalNotification, Children, Schedule, Authorization) {
  var loading = 2, 
    hideLoading = function() {
      loading--;
      !loading && ($rootScope.app.loading = false);
    },
    loadContent = function() {
      Schedule.getList().then(function(schedule) {
        var colors = ['blue', 'orange', 'red'],
          max = colors.length,
          min = 0;

        $scope.schedule = schedule.map(function(event, i) {
          event.className = colors[i % 3];
          return event;
        });
      }).finally(hideLoading);

      Children.getList().then(function(children) {
        $scope.children = children;
      }).finally(hideLoading);

      // Profile modal
      $profileScope = $scope.$new(true);
      $ionicModal.fromTemplateUrl('templates/profile.html', {
        scope: $profileScope,
        animation: 'slide-in-up',
        controller: 'ProfileController'
      }).then(function(modal) {
        $profileScope.modal = modal;
      });
    },
    $profileScope;

  Authorization.authorized().then(loadContent, function() {
    $rootScope.$on('user-did-login', loadContent);
  });

  $scope.openEvent = function(event) {
    $state.go('tab.schedule', {id: event.id})
  }

  // children list updated
  $scope.$on('clubinho-children-update', function(e, children) {
    $scope.children = children;
  });

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.prev = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.openProfile = function() {
    $profileScope.modal.show()
  }

  // View's lifecicle
  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });

  $scope.$on('$ionicView.enter', function() {
    loading && ($rootScope.app.loading = true);
  });

  $scope.$on('$destroy', function() {
    $profileScope.modal.remove();
  });
});
