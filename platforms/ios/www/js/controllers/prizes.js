angular.module('clubinho.controllers')

.controller('PrizesController', function($scope, $ionicScrollDelegate) {
  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });
});
