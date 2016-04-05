angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate, $state, $ionicPlatform, $cordovaLocalNotification, Children, Schedule, ionicToast) {
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

  // $scope.start = function() {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      alert('entrou');
      var beaconCtrl = cordova.plugins.beaconCtrl, 
        normalizeCustomValues = function(action) {
          var data = {};

          action.customValues.each(function(value) {
            data[value.name] = value.value
          });

          return data;
        }, 
        actionCanBePerfomed = function(action, save) {
          var values = normalizeCustomValues(action),
            timestampKey = 'timestamp-' + action.name,
            actionTimestampValue = values['timestamp'],
            actionTimestampStored = localStorage.getItem(timestampKey);        

          if (actionTimestampValue) {
            if (actionTimestampStored) {
              var now = new Date().getTime(),
                stored = parseInt(actionTimestampStored);
              
              if ((stored + parseInt(actionTimestampValue)) > now) {
                  return false;
              }            
            }

            if (save) {
              localStorage.setItem(timestamp, new Date().getTime());
            }
          }

          return true;
        }

      beaconCtrl.start({
        clientId     : '9c04ef1ef670e73d1e12bf03751b19076664772945d7c15490bca24facd9bbd9',
        clientSecret : 'ae8baaf4377f0cd8ef5c56a3ed6cd78db06cda4ed8279f7c5d4690b36d8539b2'
      });

      document.addEventListener('notifyAction', function(action) {
        alert('notifyAction');
        console.log('notify', action);

        var values = normalizeCustomValues(action),
          actionType = values.type;

        if (!actionCanBePerfomed(action, false)) {
          return;
        }

        if (action.type == 'custom' && actionType == 'notification') {
          var body = values.text,
            title = ('title' in values) ? values.title : '', 
            now = new Date().getTime(),
            _10SecondsFromNow = new Date(now + 10 * 1000);

          $cordovaLocalNotification.schedule({
            id: 1,
            title: title,
            data: {
              type: 'action',
              action_id: action.identifier
            },
            at: _10SecondsFromNow
          });
        } else if (action.type == 'custom' && actionType == 'checkin') {
          var now = new Date().getTime(),
            _10SecondsFromNow = new Date(now + 10 * 1000);

          $cordovaLocalNotification.schedule({
            id: 1,
            title: 'Check-in',
            data: {
              type: 'action',
              action_id: action.identifier
            },
            at: _10SecondsFromNow
          });
        }
      });

      document.addEventListener('started', function(data) {
        $scope.started = true;
      });

      document.addEventListener('didPerformAction', function(data) {
        alert('didPerformAction');
        var values = normalizeCustomValues(action),
          actionType = values.type;

        if (!actionCanBePerfomed(action, true)) {
          alert('salvou');
          return;
        }
      });

      document.addEventListener('error', function(error) {
        $scope.started = false;
        if (error.data && angular.isArray(error.data)) {
          var messages = {
            BCLBluetoothNotTurnedOnErrorKey: 'Você precisa ativar o Bluetooth do seu aparelho',
            BCLDeniedMonitoringErrorKey: 'Desculpe, mas esse aparelho não pode monitorar beacons',
            BCLDeniedLocationServicesErrorKey: 'Você precisa permitir que esse app use o serviço de localização',
            BCLDeniedBackgroundAppRefreshErrorKey: 'Você precisa permitir que esse app rode em modo background',
            BCLDeniedNotificationsErrorKey: 'Você precisa aceitar que esse app envie notificações'
          }

          angular.forEach(error.data, function(item) {
            if (item.code in messages) {
              ionicToast.show(messages[item.code], 'top', true, 1000);
            }
          });
        }
      });
    }
  });
});
