angular.module('clubinho.controllers')

.controller('SignUpCompletationController', function($scope, $rootScope, $state, $cordovaNetwork, Authorization, ionicToast, Profile) {
  
  $scope.user = Profile.getData();
  $scope.error = null;
  
  $scope.complete = function(form) {
    if (form.$invalid) {
      return;
    }
    
    if (window.cordova && $cordovaNetwork.isOffline()) {
      ionicToast.show('Você está sem internet!', 'top', false, 2500);
      return;
    }

    $scope.error = null;
    $rootScope.app.showLoading();

    Authorization.updateData($scope.user).then(function() {
      ionicToast.show('Usário cadastrado com sucesso!', 'top', false, 2500);
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
      $rootScope.app.hideLoading();
    });
  }
});
