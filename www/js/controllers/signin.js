angular.module('clubinho.controllers')

.controller('SignInController', function($scope, $rootScope, $state, $cordovaNetwork, Authorization, ionicToast) {
  $scope.user = {};

  $scope.signIn = function(form) {
    if (form.$invalid) {
      return;
    }
    
    // if ($cordovaNetwork.isOffline()) {
    //   ionicToast.show('Você está desconectado da internet', 'top', false, 2500);

    //   return;
    // }

    $scope.error = null;
    $rootScope.app.loading = true;

    Authorization.go($scope.user).then(function() {
      
    }, function(error) {
      $scope.error = error;
    }).finally(function() {
      $rootScope.app.loading = false;
    });
  }
});
