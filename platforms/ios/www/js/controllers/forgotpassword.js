angular.module('clubinho.controllers')

.controller('ForgotPasswordController', function($scope, $rootScope, $state, $cordovaNetwork, Authorization, ionicToast) {
  
  $scope.user = {};
  $scope.success = false;

  $scope.forgotPassword = function(form) {
    if (form.$invalid) {
      return;
    }
    
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você sem internet!', 'top', false, 2500);
      return;
    }

    $scope.error = null;
    $rootScope.app.loading = true;

    Authorization.forgotPassword($scope.user.email).then(function() {
      $scope.user = {};
      $scope.success = true;
    }, function(error) {
      $scope.error = error.data.message;
    }).finally(function() {
      $rootScope.app.loading = false;
    });
  }

  $scope.cancel = function() {
    $state.go('signin');
  }
});
