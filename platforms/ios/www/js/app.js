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
      cordova.plugins.beaconCtrl.start({
        clientId: '9c04ef1ef670e73d1e12bf03751b19076664772945d7c15490bca24facd9bbd9',
        clientSecret: 'ae8baaf4377f0cd8ef5c56a3ed6cd78db06cda4ed8279f7c5d4690b36d8539b2'
      });

      document.addEventListener('willNotifyAction', function(data) {
        alert('entrou no willNotifyAction');
      });

      document.addEventListener('didPerformAction', function(data) {
        alert('entrou no didPerformAction');
      });

      document.addEventListener('error', function(data) {
        alert('ERROR ' + JSON.stringify(data));
      });
    }
  });
})
