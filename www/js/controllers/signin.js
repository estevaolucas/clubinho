angular.module('clubinho.controllers')

.controller('SignInController', function($scope, $rootScope, $state, $cordovaNetwork, Authorization, ionicToast) {
  
  $scope.$on('$ionicView.enter', function( scopes, states ) {
    $scope.user = {};
    $scope.error = null;
  });

  $scope.signIn = function(form) {
    if (form.$invalid) {
      return;
    }
    
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você sem internet!', 'top', false, 2500);
      return;
    }

    $scope.error = null;
    $rootScope.app.loading = true;

    Authorization.go($scope.user).then(function() {
      $scope.user = {};      
    }, function(error) {
      $scope.error = error;
    }).finally(function() {
      $rootScope.app.loading = false;
    });
  }
});
