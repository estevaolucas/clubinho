angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $cordovaLocalNotification, $cordovaDialogs, Children, Schedule, Authorization, Profile) {
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

  $scope.$on('clubinho-beacon-checkin', function(e, values) {
    var newEvent = Schedule.getNextEventFromNow();

    if (newEvent) {
      console.log('clubinho-beacon-checkin-event', JSON.stringify(newEvent));
      
      var notificationId = newEvent.id + 300,
        notificationDate = new Date(newEvent.date),
        minutesBeforeToRemember = 15;
      
      notificationDate.setMinutes(newEvent.date.getMinutes() - minutesBeforeToRemember);

      $scope.loading = false;

      // TODO: remove this test dialog
      $cordovaDialogs.confirm(newEvent.title, 'Check-in', ['OK']);
      
      // Add evento to confirmation list
      Profile.addEventToConfirm(newEvent);

      // Show a remember notification 
      if (window.cordova) {
        $cordovaLocalNotification.schedule({
          id: notificationId,
          title: newEvent.title + ' vai começar em ' + minutesBeforeToRemember + ' minutos.',
          data: {
            type: 'event',
            id: newEvent.id
          },
          at: notificationDate
        });
      }
    } else {
      console.log('clubinho-beacon-checkin-no-event', JSON.stringify(values), newEvent);
    }
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
