angular.module('clubinho.controllers')

.controller('MainController', function($scope, $ionicPlatform, $cordovaLocalNotification, ionicToast, $ionicModal, $rootScope, $ionicModal, $cordovaDialogs, $cordovaBadge, Children, Profile) {
  var credentials = {
      clientId     : '314cf024dc86d8bcf509bf1ad874fab1a6cfca724a2fa91bc8d33d35c274df0e',
      clientSecret : '0125e3b07d9635a46142492b561a9a2fe1d83862b7f6996d883860fc9f270b68'
    },
    normalizeCustomValues = function(action) {
      var data = {};

      action.customValues.forEach(function(value) {
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
        actionTimestampValue = actionTimestampValue * 1000;

        if (actionTimestampStored) {
          var now = new Date().getTime(),
            stored = parseInt(actionTimestampStored);
          
          if ((stored + parseInt(actionTimestampValue)) > now) {
              return false;
          }            
        }

        if (save) {
          localStorage.setItem(timestampKey, new Date().getTime());
        }
      }

      return true;
    },
    startBeaconMonitoring = function() {
      if (!loggedIn || !ionicPlatformReady || beaconStarted) {
        return;
      }
      
      if (window.cordova && window.cordova.plugins.beaconCtrl) {
        beaconStarted = true
        cordova.plugins.beaconCtrl.start(credentials, function() {
          console.log('beacon event - beacon iniciado');
        });  
      }
    }, 
    templateEngine = function(tpl, data) {
      var re = /{{([^}}]+)?}}/g, 
        match;

      while(match = re.exec(tpl)) {
        tpl = tpl.replace(match[0], data[match[1]])
      }
      
      return tpl;
    },
    beaconStarted = false,
    ionicPlatformReady = false,
    loggedIn = false,
    notificationIdToListErrors = 1200;

  $scope.beacon = {
    disabled: false
  };

  $scope.tryAgain = function() {
    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      $rootScope.app.showLoading();

      cordova.plugins.beaconCtrl.start(credentials, function() {
        $rootScope.app.hideLoading();

        console.log('beacon', $scope.beacon);
        if (!$scope.beacon.errors || !$scope.beacon.errors.length) {
          $scope.beacon.modal.remove();

          ionicToast.show('Pronto! Agora está tudo OK.', 'top', false, 2500);
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

  document.addEventListener('started', function(data) {
    $scope.beacon.disabled = false;
    $scope.beacon.errors = null;

    $cordovaBadge.clear();
    $cordovaLocalNotification.clear(notificationIdToListErrors);
  });

  // Evento acontece em background.
  document.addEventListener('notifyAction', function(action) {
    var values = normalizeCustomValues(action),
      actionType = values.type;

    if (!actionCanBePerfomed(action, false) || action.actionType != 'custom') {
      return;
    }

    Children.getList().then(function(children) {
      if (actionType == 'notification') {
        var message = values.text,
          title = ('title' in values) ? values.title : '', 
          now = new Date().getTime(),
          _1SecondsFromNow = new Date(now + 1 * 1000),
          
          notify = function(message) {
            $cordovaLocalNotification.schedule({
              id: 1,
              title: message,
              data: {
                type: 'action',
                action_id: action.identifier
              },
              sound: 'res://platform_default',
              at: _1SecondsFromNow
            });
          };

        // Wellcome message
        if (values.id == 'onHello') {
          if (!children.length) {
            return;
          }

          notify(templateEngine(message, {
            name: Profile.getData().name,
            children: children.map(function(child) {
              return child.name;
            }).join(', ')
          }));
        } else {
          notify(message);
        }
      } else if (actionType == 'checkin' && children.length) {
        $rootScope.$broadcast('clubinho-beacon-checkin-notification', action);
      }
    });
  });

  // Evento acontece quando o aplicativo está aberto e rodando na tela do usuário
  document.addEventListener('didPerformAction', function(action) {
    var values = normalizeCustomValues(action);

    if (!actionCanBePerfomed(action, true) || action.actionType != 'custom') {
      return;
    }

    // alert box
    if (values.type == 'notification') {
      var message = values.text,
        title = ('title' in values) ? values.title : '';
 
      if (values.id != 'onHello') {
        $cordovaDialogs.confirm(message, title, ['OK']);
      }
    // check-in area
    } else if (values.type == 'checkin') {
      Children.getList().then(function(children) {
        if (!children.length) {
          return;
        }

        $rootScope.$broadcast('clubinho-beacon-checkin', action);
      });
    }
  });

  document.addEventListener('error', function(error) {
    if (error.data && angular.isArray(error.data)) {
      var codes = error.data.map(function(error) {
          return error.code;
        }),
        message = 'Favor habilitar os itens necessário para o funcionamento correto do aplicativo',
        now = new Date().getTime();

      $scope.beacon.disabled = true;
      $scope.beacon.errors = codes;

      if (codes.length == 1) {
        var types = {
            BCLBluetoothNotTurnedOnErrorKey: 'ligar o Bluetooth',
            BCLDeniedLocationServicesErrorKey: 'habilitar a Localização para Sempre',
            BCLDeniedBackgroundAppRefreshErrorKey: 'habilitar a Atualização em 2° Plano',
            BCLDeniedNotificationsErrorKey: 'permitir Notificações'
          };

        message = 'Favor ' + types[codes[0]] + ' em Ajustes';
      }

      $cordovaLocalNotification.schedule({
        id: notificationIdToListErrors,
        title: message,
        at: new Date(now + 1 * 1000),
        sound: 'res://platform_default'
      });

      $cordovaBadge.increase(1);
    }
  });  

  // Onboarding modal
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

  $rootScope.app.loadingCount = 0;
  $rootScope.app.showLoading = function() {
    $rootScope.app.loadingCount++;
  }

  $rootScope.app.hideLoading = function() {
    $rootScope.app.loadingCount--;

    if ($rootScope.app.loadingCount < 0) {
      $rootScope.app.loadingCount = 0;
    }
  }
});
