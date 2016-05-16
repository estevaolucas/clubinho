angular.module('clubinho.controllers')

.controller('SignInController', function($scope, $rootScope, $state, $cordovaNetwork, $state, Authorization, ionicToast, Profile) {
  
  $scope.$on('$ionicView.enter', function( scopes, states ) {
    $scope.user = {};
    $scope.error = null;

    if (Profile.token()) {
      $state.go('tab.home', {}, {reload: true});
    }
  });

  $scope.signIn = function(form) {
    if (form.$invalid) {
      return;
    }
    
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você está sem internet!', 'top', false, 2500);
      return;
    }

    $scope.error = null;
    $rootScope.app.showLoading();

    Authorization.go($scope.user).then(function() {
      $scope.user = {};
      form.$setPristine(true);
    }, function(error) {
      $scope.error = error;
    }).finally(function() {
      $rootScope.app.hideLoading();
    });
  }

  $scope.facebook = function() {
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você está sem internet!', 'top', false, 2500);
      return;
    }
    
    Authorization.facebook().then(function(user) {
      console.log(user);
    }, function(error) {
      $scope.error = error;
    }).finally(function() {
      $rootScope.app.hideLoading();
    });
  }
});
