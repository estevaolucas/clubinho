angular.module('clubinho.directives', [])

.directive('clubinhoLoader', function() {
  return {
    restrict: 'A',
    scope: {
      show: '='
    },
    templateUrl: 'templates/directives/clubinho-loader.html',
    link: function(scope, element, attr) {
    }
  }
})

.directive('clubinhoChildrenList', function($ionicScrollDelegate) {
  return {
    restrict: 'A',
    scope: {
      children: '=list',
      addChild: '=',
      editChild: '=',
      deleteChild: '='
    },
    templateUrl: 'templates/directives/clubinho-children-list.html',
    link: function(scope, element, attr ) {
      scope.toggleChild = function(child, e) {
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
    } 
  }
});
