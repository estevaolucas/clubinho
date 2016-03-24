angular.module('clubinho.controllers')

.controller('ScheduleController', function($scope, $ionicModal, $timeout, $ionicScrollDelegate, Schedule) {
  $scope.scheduleCtrl = {
    loading: true
  }

  $scope.toggleFavorite = function(event) {
    $scope.loading = true;

    $timeout(function() {
      $scope.loading = false;
      event.favorite = !event.favorite;
    }, 500);
  }

  $scope.detail = function(event) {
    $ionicModal.fromTemplateUrl('templates/schedule-detail.html', {
      scope: $scope,
      animation: 'slide-in-up',
      controller: 'ScheduleDetailController'
    }).then(function(modal) {
      $ionicScrollDelegate.scrollTop();

      $scope.scheduleCtrl.modal = modal;
      $scope.scheduleCtrl.modal.show();
      $scope.event = event;
    });
  }

  Schedule.getList().then(function(schedule) {
    $scope.schedule = schedule;
    $scope.loading = false;
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });
})

.controller('ScheduleDetailController', function($scope) {
  $scope.toggleFavorite = function(event) {
    event.favorite = !event.favorite;
  }

  $scope.close = function() {
    $scope.$parent.scheduleCtrl.modal.hide();
    $scope.$parent.scheduleCtrl.modal.remove();
  }
});
