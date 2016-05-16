angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $cordovaLocalNotification, $cordovaDialogs, Children, Schedule, Authorization, Profile) {
  var hideLoading = function() {
      $rootScope.app.hideLoading();
    },
    loadContent = function() {
      Children.getList().then(function(children) {
        $scope.children = children;
      }).finally(hideLoading);
    },
    $profileScope;

  $rootScope.app.showLoading();
  Authorization.authorized().then(function() {
    loadContent();

    $rootScope.$on('user-did-login', loadContent);

    Schedule.getList().then(function(schedule) {
      var colors = ['blue', 'orange', 'red'],
        max = colors.length,
        min = 0;

      $scope.schedule = schedule.map(function(event, i) {
        event.className = colors[i % 3];
        return event;
      });
    }).finally(hideLoading);
  }, function() {
    $state.go('signin');
    $rootScope.$on('user-did-login', loadContent);
  }).finally(hideLoading);

  $scope.openEvent = function(event) {
    $state.go('tab.schedule', {id: event.id})
  }

  // children list updated
  $scope.$on('clubinho-children-update', function(e, children) {
    $scope.children = children;
  });

  $scope.$on('clubinho-beacon-checkin', function(e, values) {
    var nextEvent = Schedule.getNextEventFromNow();

    if (nextEvent) {
      console.log('clubinho-beacon-checkin-event', JSON.stringify(nextEvent));
      
      var notificationId = nextEvent.id + 300,
        notificationDate = new Date(nextEvent.date),
        minutesBeforeToRemember = 15;
      
      notificationDate.setMinutes(nextEvent.date.getMinutes() - minutesBeforeToRemember);

      // TODO: remove this test dialog
      // $cordovaDialogs.confirm(nextEvent.title, 'Check-in', ['OK']);
      
      // Add evento to confirmation list
      if (Profile.addEventToConfirm(nextEvent)) {
        // Notify directive
        $rootScope.$broadcast('clubinho-event-to-confirm');

        // Show a reminder notification 
        if (window.cordova) {
          $cordovaLocalNotification.schedule({
            id: notificationId,
            title: nextEvent.title + ' vai começar em ' + minutesBeforeToRemember + ' minutos.',
            data: {
              type: 'event',
              id: nextEvent.id
            },
            at: notificationDate
          });
        }
      }
    } else {
      console.log('clubinho-beacon-checkin-no-event', JSON.stringify(values), nextEvent);
    }
  });

  $scope.$on('clubinho-beacon-checkin-notification', function(e, values) {
    var nextEvent = Schedule.getNextEventFromNow(),
      now = new Date().getTime();

    if (!nextEvent) {
      return;
    }

    $cordovaLocalNotification.schedule({
      id: 4001,
      title: 'Olá, você está na area de check-in do espaço Clubinho.',
      data: {
        type: 'action',
        action_id: action.identifier
      },
      at: new Date(now + 1000)
    });
  });

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.prev = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.openProfile = function() {
    // Profile modal
    $profileScope = $scope.$new(true);
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $profileScope,
      animation: 'slide-in-up',
      controller: 'ProfileController'
    }).then(function(modal) {
      $profileScope.modal = modal;

      modal.show();
    });
  }

  // View's lifecicle
  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });

  $scope.$on('$destroy', function() {
    $profileScope.modal.remove();
  });
});
