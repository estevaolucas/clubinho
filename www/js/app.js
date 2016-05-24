angular.module('clubinho', [
  'ionic', 
  'ionic-cache-src',
  'angular-cache',
  'clubinho.controllers', 
  'clubinho.services',
  'clubinho.directives'
])

.constant('apiConfig', {
  baseUrl: 'http://192.168.25.15/clubinho-api/api/v1',
  // baseUrl: 'http://peppersp.com.br/beacon/api/v1'
})

.config(function($stateProvider, $urlRouterProvider, $cordovaFacebookProvider, $httpProvider) {
  $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
    return {
      request: function(config) {
        var token = localStorage.getItem('token');

        if (!token) {
          return config;
        }

        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
        
        return config;
      }
    };
  }]);

  $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInController'
    })

    .state('signup', {
      url: '/sign-up',
      templateUrl: 'templates/sign-up.html',
      controller: 'SignUpController'
    })

    .state('signup-completation', {
      url: '/sign-up-completation',
      templateUrl: 'templates/sign-up-completation.html',
      controller: 'SignUpCompletationController'
    })

    .state('forgotpassword', {
      url: '/forgot-password',
      templateUrl: 'templates/forgot-password.html',
      controller: 'ForgotPasswordController'
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
      url: '/schedule?:id',
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
  
  facebookConnectPlugin && $cordovaFacebookProvider.browserInit('977939322243298', 'v2.5');
})

.run(function($ionicPlatform, $rootScope, $state, $ionicModal, Authorization, Schedule, $ionicHistory, $timeout, $cordovaDialogs, $cordovaNetwork, $window) {
  $rootScope.app = {};

  $rootScope.$on('user-did-login', function() {
    $state.go('tab.home', {}, {reload: true});
  });

  $rootScope.$on('user-did-facebook-signup', function() {
    $state.go('signup-completation');
  });

  $rootScope.$on('user-did-logout', function() {
    $state.go('signin');
    $timeout(function(){
      $ionicHistory.clearCache();
    }, 100);

    if (window.cordova && window.cordova.plugins.beaconCtrl) {
      cordova.plugins.beaconCtrl.stop();
    }
  });

  $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
    console.log(notification);
  });

  $ionicPlatform.ready(function() {
    if (window.cordova) {
      if ($cordovaNetwork.isOffline()) {
        $cordovaDialogs.confirm('Você está sem internet!', 'Problema!', ['OK']);

        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
          $state.go('tab.home', {}, {reload: true});
          $window.location.reload(true)

          $timeout(function() {
            navigator.splashscreen.hide();
          }, 1000);
          
          $rootScope.$$listeners['$cordovaNetwork:online'] = [];
        });
      } else {
        navigator.splashscreen.hide();
      } 
    }

    // Local notification handle
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
      cordova.plugins.notification.local.on('click', function(notification) {
        var data = JSON.parse(notification.data);

        // Open event detail
        if (data.type == 'event') {
          $state.go('tab.schedule', {id: data.id})
        }
      });
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  if (ionic.Platform.platform() == 'ios') {
    var ios6 = window.matchMedia('(min-device-width : 375px) and (max-device-width : 667px) and (orientation : portrait)'),
      ios6plus = window.matchMedia('(min-device-width : 414px) and (max-device-width : 736px) and (orientation : portrait)');

    if (ios6.matches) {
      $('body').addClass('ios6');
    } else if (ios6plus.matches) {
      $('body').addClass('ios6plus');
    }
  }
});

window.onerror = function(msg, url, line, col, error) {
  var extra = !col ? '' : '\ncolumn: ' + col;
  
  extra += !error ? '' : '\nerror: ' + error;
  console.log('JS Error: ' + msg + '\nurl: ' + url + '\nline: ' + line + extra);
};
