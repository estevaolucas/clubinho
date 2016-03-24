angular.module('clubinho.controllers')

.controller('AboutController', function($scope, $ionicScrollDelegate) {
  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });
});
