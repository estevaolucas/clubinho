angular.module('clubinho.controllers')

.controller('ScheduleController', function($scope, $ionicModal, $rootScope, $timeout, $ionicScrollDelegate, $cordovaLocalNotification, $stateParams, Schedule) {
  
  // Add/remove event from favorite list
  $scope.toggleFavorite = function(event) {
    $scope.loading = true;

    $timeout(function() {
      var isFavorite = Schedule.setFavorite(event),
        notificationId = event.id + 200,
        now = new Date().getTime(),
        _10SecondsFromNow = new Date(now + 10 * 1000);

      $scope.loading = false;

      if (!window.cordova) {
        return event.favorite = isFavorite;
      }

      // Add a local notification
      if (isFavorite) {
        $cordovaLocalNotification.schedule({
          id: notificationId,
          title: event.title + ' já vai começar.',
          data: {
            type: 'event',
            id: event.id
          },
          at: _10SecondsFromNow // FIXME: add currect time
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

  // Show event's detail
  $scope.detail = function(event) {
    $ionicModal.fromTemplateUrl('templates/schedule-detail.html', {
      scope: $scope,
      animation: 'slide-in-up',
      controller: 'ScheduleDetailController'
    }).then(function(modal) {
      $ionicScrollDelegate.scrollTop();

      $scope.modal = modal;
      $scope.modal.show();
      $scope.event = event;
    });
  }

  // Get list of events
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
  $scope.close = function() {
    $scope.$parent.modal.hide();
    $scope.$parent.modal.remove();
  }
});
