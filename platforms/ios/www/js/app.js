angular.module('clubinho', [
  'ionic', 
  'clubinho.controllers', 
  'clubinho.services',
  'clubinho.directives'
])

.config(function($stateProvider, $urlRouterProvider) {
  // setup an abstract state for the tabs directive
  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tab.schedule', {
    url: '/schedule',
    views: {
      'tab-schedule': {
        templateUrl: 'templates/tab-schedule.html',
        controller: 'ScheduleController'
      }
    }
  })

  .state('tab.prizes', {
    url: '/prizes',
    views: {
      'tab-prizes': {
        templateUrl: 'templates/tab-prizes.html',
        controller: 'PrizesController'
      }
    }
  })

  .state('tab.about', {
    url: '/about',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-about.html',
        controller: 'AboutController'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/schedule');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      cordova.plugins.beaconCtrl.start({
        clientId    : '9c04ef1ef670e73d1e12bf03751b19076664772945d7c15490bca24facd9bbd9',
        clientSecret: 'ae8baaf4377f0cd8ef5c56a3ed6cd78db06cda4ed8279f7c5d4690b36d8539b2'
      });

      document.addEventListener('notifyAction', function(data) {
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
});
