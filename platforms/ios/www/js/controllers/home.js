angular.module('clubinho.controllers')

.controller('HomeController', function($scope, $ionicModal, $ionicScrollDelegate, Children) {
  $ionicModal.fromTemplateUrl('templates/profile.html', {
    scope: $scope,
    animation: 'slide-in-up',
    controller: 'ProfileController'
  }).then(function(modal) {
    $scope.profile = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.profile.remove();
  });
  
  $scope.openProfile = function() {
    $scope.profile.show()
  }

  Children.getList().then(function(children) {
    $scope.children = children;
  });

  var $elements = $('.home .rank li'),
    open = false;

  $scope.toggleChild = function(child, e) {
    var $this = $(e.target);
    
    $this = $this.is('li') ? $this : $this.closest('li');

    $this
      .toggleClass('open')
      .siblings('li').removeClass('open');

    $ionicScrollDelegate.resize();

    setTimeout(function() {
      $ionicScrollDelegate.resize();
    }, 500);
  };

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
