angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $ionicModal, $ionicScrollDelegate, Children) {
  var $profileScope = $scope.$new(true);

  $ionicModal.fromTemplateUrl('templates/profile.html', {
    scope: $profileScope,
    animation: 'slide-in-up',
    controller: 'ProfileController'
  }).then(function(modal) {
    $profileScope.modal = modal;
  });

  $scope.openProfile = function() {
    $profileScope.modal.show()
  }

  Children.getList().then(function(children) {
    $scope.children = children;
  });

  // children list updated
  $scope.$on('clubinho-children-update', function(e, children) {
    $scope.children = children;
  });

  $scope.$on('$destroy', function() {
    $profileScope.remove();
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    $ionicScrollDelegate.scrollTop();
  });

  // Activate slider
  $('.home .bxslider').bxSlider({
    auto: true,
    responsive: true,
    adaptiveHeight: true,
    pager: false,
    nextText: ' > ',
    prevText: ' < '  
  });
});
