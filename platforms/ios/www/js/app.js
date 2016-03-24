angular.module('clubinho', [
  'ionic', 
  'ionic-cache-src',
  'clubinho.controllers', 
  'clubinho.services',
  'clubinho.directives'
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInController'
    })

    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      data: {
        authorization: true
      }
    })

    .state('tab.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'templates/tab-home.html',
          controller: 'HomeController'
        }
      }
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

  $urlRouterProvider.otherwise('/tab/home');
})

.run(function($ionicPlatform, $rootScope, $state, Authorization) {
  $rootScope.app = {
    loading: false
  };

  // if (Authorization.authorized()) {
  //   alert('autorizado');
  //   $state.go('tab.home');
  // }

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

    if (toState.data && toState.data.authorization) {
      if (!Authorization.authorized()) {
        alert('autorizado?');
        alert(Authorization.authorized());
        $state.go('signin');   
      } else {
        alert('na')
      }
      
    } else {
      alert('não precisa');
    }
  });

  $rootScope.$on('user-did-login', function() {
    alert('login feito');
    $state.go('tab.home'); 
  });

  $rootScope.$on('user-did-logout', function() {
    $state.go('signin');
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(false);

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
        //alert('entrou no error');
      });
    }
  });
});
