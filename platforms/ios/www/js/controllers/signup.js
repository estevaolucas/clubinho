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

    Authorization.signUp($scope.user).then(function() {
      ionicToast.show('Usário cadastrado com sucesso!', 'top', false, 2500);
      $scope.user = {};
      form.$setPristine(true);
    }, function(response) {
      if (response.data.data && response.data.data.params) {
        var errors = [];

        for(var error in response.data.data.params) {
          errors.push(response.data.data.params[error]);
        };

        $scope.error = errors.join(', ');
      } else if(response.data.message) {
        $scope.error = response.data.message;
      } else {
        $scope.error = 'Não foi possível alterar seus dados.';
      }
    }).finally(function() {
      $rootScope.app.loading = false;
    });
  }

  $scope.cancel = function() {
    $state.go('signin');
  }
});
