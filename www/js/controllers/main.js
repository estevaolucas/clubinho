angular.module('clubinho.controllers')

.controller('MainController', function($scope, $ionicPlatform, $cordovaLocalNotification, ionicToast, $ionicModal, $rootScope) {
  var credentials = {
      clientId     : '9c04ef1ef670e73d1e12bf03751b19076664772945d7c15490bca24facd9bbd9',
      clientSecret : 'ae8baaf4377f0cd8ef5c56a3ed6cd78db06cda4ed8279f7c5d4690b36d8539b2'
    },
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
    },
    startBeaconMonitoring = function() {
      if (!loggedIn || !ionicPlatformReady) {
        return;
      }
      
      if (window.cordova && window.cordova.plugins.beaconCtrl) {
        cordova.plugins.beaconCtrl.start(credentials);  
      }
    }, 
    ionicPlatformReady = false,
    loggedIn = false;

  $scope.beacon = {
    disabled: false
  };

  $scope.tryAgain = function() {
    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      $rootScope.app.loading = true;

      cordova.plugins.beaconCtrl.start(credentials, function() {
        $rootScope.app.loading = false;

        console.log('beacon', $scope.beacon);
        if (!$scope.beacon.errors || !$scope.beacon.errors.length) {
          $scope.beacon.modal.remove();

          ionicToast.show('Pronto! Todos os requerimentos estão Ok.', 'top', false, 2500);
        }
      });
    }
  }

  $scope.openSettings = function() {
    console.log('open settings clicked', cordova);

    if (window.cordova && cordova.plugins.settings.openSetting) {
      cordova.plugins.settings.open();
    }
  }

  $scope.openAlert = function() {
    $ionicModal.fromTemplateUrl('templates/beacon-alert.html', {
      scope: $scope,
      animation: 'slide-in-up',
      controller: 'ProfileController'
    }).then(function(modal) {  
      $scope.beacon.modal = modal;    
      $scope.close = function() {
        modal.remove();
      }

      modal.show();
    });
  }

  $rootScope.$on('user-did-login', function() {
    loggedIn = true;

    startBeaconMonitoring();
  });
  
  $ionicPlatform.ready(function() {
    ionicPlatformReady = true;

    startBeaconMonitoring();
  });

  document.addEventListener('notifyAction', function(action) {
    alert('notifyAction');
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
    $scope.beacon.disabled = false;
    $scope.beacon.errors = null;
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
    if (error.data && angular.isArray(error.data)) {
      $scope.beacon.disabled = true;
      $scope.beacon.errors = error.data.map(function(error) {
        return error.code;
      });
    }
  });  
});
