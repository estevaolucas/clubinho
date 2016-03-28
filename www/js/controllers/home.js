angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, Children, Schedule) {
  $scope.loading = true;
  
  Schedule.getList().then(function(schedule) {
    var colors = ['blue', 'orange', 'red'],
      max = colors.length,
      min = 0;

    $scope.schedule = schedule.map(function(event, i) {
      event.className = colors[i % 3];
      return event;
    });
    $scope.loading = false;
  });

  var $profileScope = $scope.$new(true);
  $ionicModal.fromTemplateUrl('templates/profile.html', {
    scope: $profileScope,
    animation: 'slide-in-up',
    controller: 'ProfileController'
  }).then(function(modal) {
    $profileScope.modal = modal;
  });

  $scope.openEvent = function(event) {
    $state.go('tab.schedule', {id: event.id})
  }

  $scope.openProfile = function() {
    $profileScope.modal.show()
  }

  Children.getList().then(function(children) {
    $scope.children = children;
  });

  // children list updated
  $scope.$on('clubinho-children-update', function(e, children) {
    $scope.children = children;
  });

  $scope.$on('$destroy', function() {
    $profileScope.remove();
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.prev = function() {
    $ionicSlideBoxDelegate.previous();
  };
});
