angular.module('clubinho.directives', [])

.directive('clubinhoLoader', function() {
  return {
    restrict: 'A',
    scope: {
      show: '='
    },
    templateUrl: 'templates/directives/clubinho-loader.html',
    link: function(scope, element, attr) {
      console.log('entrou')
    }
  }
})
