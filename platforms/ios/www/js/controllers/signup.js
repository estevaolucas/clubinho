angular.module('clubinho.controllers')

.controller('SignUpController', function($scope, $rootScope, $state, $cordovaNetwork, Authorization, ionicToast) {
  
  $scope.$on('$ionicView.enter', function( scopes, states ) {
    $scope.user = {};
    $scope.error = null;
  });

  $scope.signUp = function(form) {
    if (form.$invalid) {
      return;
    }
    
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você está sem internet!', 'top', false, 2500);
      return;
    }

    $scope.error = null;
    $rootScope.app.loading = true;

    // Authorization.go($scope.user).then(function() {
    //   $scope.user = {};
    //   form.$setPristine(true);
    // }, function(error) {
    //   $scope.error = error;
    // }).finally(function() {
    //   $rootScope.app.loading = false;
    // });
  }
});
