angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $cordovaLocalNotification, Children, Schedule) {
  var loading = 2, 
    hideLoading = function() {
      loading--;
      !loading && ($rootScope.app.loading = false);
    };

  $scope.$on('$ionicView.loaded', function() {
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

  // Profile modal
  var $profileScope = $scope.$new(true);
  $ionicModal.fromTemplateUrl('templates/profile.html', {
    scope: $profileScope,
    animation: 'slide-in-up',
    controller: 'ProfileController'
  }).then(function(modal) {
    $profileScope.modal = modal;
  });

  $scope.openProfile = function() {
    $profileScope.modal.show()
  }

  // View's lifecicle
  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });

  $scope.$on('$ionicView.enter', function() {
    loading && ($rootScope.app.loading = true);
  
    if (!localStorage.getItem('onboarded')) {
      $ionicModal.fromTemplateUrl('templates/onboarding.html', {
        scope: $scope,
        animation: 'slide-in-up',
      }).then(function(modal) {
        modal.show();
        
        localStorage.setItem('onboarded', true);

        $scope.close = function() {
          modal.hide();
        }
      });
    }
  });

  $scope.$on('$destroy', function() {
    $profileScope.modal.remove();
  });
});
