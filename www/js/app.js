angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      
    }

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      cordova.plugins.beaconCtrl.start();

      document.addEventListener('willNotifyAction', function(data) {
        alert('entrou no willNotifyAction');
      });

      document.addEventListener('didPerformAction', function(data) {
        alert('entrou no didPerformAction');
      });

      document.addEventListener('error', function(data) {
        alert('entrou no error');
      });
    }
  });
})
