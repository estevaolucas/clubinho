angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $cordovaLocalNotification, $cordovaDialogs, Children, Schedule, Authorization, Profile, ionicToast, $cordovaBadge) {
  var hideLoading = function() {
      $rootScope.app.hideLoading();
    },
    loadContent = function() {
      Children.getList().then(function(children) {
        $scope.loadingChildren = false;
        $scope.children = children;

        updateChildrenPosition();
      }).finally(hideLoading);

      if (listLoaded) {
        return
      };
      
      Schedule.getList().then(function(schedule) {
        listLoaded = true;
        $scope.schedule = schedule;

        updateChildrenPosition();
      }).finally(hideLoading);
    },
    updateChildrenPosition = function() {
      var $home = $('.home ion-content'), 
        $events = $('.events', $home),
        screenHeight = $home.height(),
        eventsPosition;

      if ($events.length) {
        eventsPosition = $events.offset().top + $events.height();
        $('.fixed .children', $home).height(screenHeight - eventsPosition - 15);
      }
    },
    listLoaded = false,
    $profileScope;

  $rootScope.app.showLoading();
  $scope.loadingChildren = true;

  Authorization.authorized().then(function() {
    loadContent();

    $rootScope.$on('user-did-login', loadContent);
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

    updateChildrenPosition();
  });

  var checkinNotificationId = 123445;

  $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
    if (notification.id == checkinNotificationId) {
      $rootScope.$broadcast('clubinho-beacon-checkin', notification);
    }

    $cordovaBadge.clear();
  });

  $scope.$on('clubinho-beacon-checkin', function(e, action) {
    var nextEvent = Schedule.getNextEventFromNow();

    if (!nextEvent) {
      return;
    }
      
    var notificationId = nextEvent.id + 300,
      notificationDate = new Date(nextEvent.date),
      minutesBeforeToRemember = 15;
    
    notificationDate.setMinutes(nextEvent.date.getMinutes() - minutesBeforeToRemember);

    // Add event to confirmation list
    if (Profile.addEventToConfirm(nextEvent)) {
      // Notify directive
      $rootScope.$broadcast('clubinho-event-to-confirm');

      // Show a reminder notification 
      if (window.cordova) {
        $cordovaLocalNotification.schedule({
          id: notificationId,
          title: nextEvent.title + ' vai começar em ' + minutesBeforeToRemember + ' minutos.',
          sound: 'res://platform_default',
          data: {
            type: 'event',
            id: nextEvent.id
          },
          at: notificationDate
        });
      }
    }
  });

  $scope.$on('clubinho-beacon-checkin-notification', function(e, action) {
    Schedule.getList().then(function() {
      var nextEvent = Schedule.getNextEventFromNow(),
        now = new Date().getTime();

      if (!nextEvent) {
        return;
      }

      $cordovaLocalNotification.schedule({
        id: checkinNotificationId,
        title: 'Olá, você está na area de check-in do espaço Clubinho. Você confirma?',
        sound: 'res://platform_default',
        badge: 1,
        data: {
          type: 'action',
          action_id: action.identifier
        },
        at: new Date(now + 1000)
      });
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
