angular.module('clubinho.controllers')

.controller('SignInController', function($scope, $state) {
  $scope.user = {
    username: '',
    password : ''
  };

  $scope.signIn = function(form) {
    if (form.$invalid) {
      return;
    }
    
    $state.go('tabs.home');
  }
})
