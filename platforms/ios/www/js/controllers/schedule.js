angular.module('clubinho.controllers')

.controller('ScheduleController', function($scope, $ionicModal, $rootScope, $timeout, $ionicScrollDelegate, $cordovaLocalNotification, $stateParams, Schedule) {
  $scope.scheduleCtrl = {
    loading: true
  }

  $scope.toggleFavorite = function(event) {
    $scope.loading = true;

    $timeout(function() {
      $scope.loading = false;
      var isFavorite = Schedule.setFavorite(event),
        notificationId = event.id + 200,
        now = new Date().getTime(),
        _10SecondsFromNow = new Date(now + 10 * 1000);

      // Create Local notification
      if (isFavorite) {
        $cordovaLocalNotification.schedule({
          id: notificationId,
          title: event.title_plain + ' já vai começar.',
          data: {
            type: 'event',
            id: event.id
          },
          at: _10SecondsFromNow
        }).then(function(result) {
          event.favorite = isFavorite;
        });

      // Remove local notification
      } else {
        $cordovaLocalNotification.cancel(notificationId).then(function(result) {
          event.favorite = isFavorite;
        });
      }
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

    if ($stateParams.id) {
      var eventsId = $scope.schedule.map(function(event) {
        return $stateParams.id;
      });

      if (eventsId.indexOf($stateParams.id) != -1) {
        $scope.detail($scope.schedule.filter(function(event) {
          return event.id == $stateParams.id;
        })[0]);
      }
    }
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
