angular.module('clubinho.directives', [])

.directive('clubinhoLoader', function() {
  return {
    restrict: 'A',
    scope: {
      show: '='
    },
    templateUrl: 'templates/directives/clubinho-loader.html'
  }
})

.directive('clubinhoChildrenList', function($ionicScrollDelegate, Children, Profile, $timeout) {
  return {
    restrict: 'A',
    scope: {
      children: '=list',
      addChild: '=',
      editChild: '=',
      deleteChild: '=',
      eventsToConfirm: '='
    },
    templateUrl: 'templates/directives/clubinho-children-list.html',
    link: function(scope, element, attr) {
      if (scope.eventsToConfirm) {
        var updateScope = function() {
            var eventsToConfirm = Profile.eventsToConfirm(true, true);

            if (scope.hasOwnProperty('children') && scope.children.length) {
              scope.children.forEach(function(child) {
                var filteredEventsToConfirm = eventsToConfirm.filter(function(event) {
                    return event.children.indexOf(child.id) !== -1;
                });

                child.eventToConfirm = filteredEventsToConfirm.length ? 
                  filteredEventsToConfirm[0] : 
                  null;
              });
            }
          },
          confirm = function(confirm, child) {
            Children.confirmPresence(confirm, child.eventToConfirm, child).then(function() {
              Profile.removeEventToConfirm(child.eventToConfirm, child);
              updateScope();
            });
          },
          unwatch = scope.$watch('children', function(newValue, oldValue) {
            if (newValue === oldValue) {
              return;
            }

            updateScope();
            unwatch();
          });

        scope.confirm = function(child) {
          confirm(true, child);
        }

        scope.decline = function(child) {
          confirm(false, child);
        }
      }

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
})

.directive('passwordVerify', function() {
  return {
    require: 'ngModel',
    scope: {
      passwordVerify: '='
    },
    link: function(scope, element, attrs, controller) {
      scope.$watch(function() {
        var combined;

        if (scope.passwordVerify || controller.$viewValue) {
          combined = scope.passwordVerify + '_' + controller.$viewValue; 
        }                    
        
        return combined;
      }, function(value) {
        if (value) {
          controller.$parsers.unshift(function(viewValue) {
            var origin = scope.passwordVerify;

            if (origin !== viewValue) {
              controller.$setValidity('passwordVerify', false);
              return undefined;
            } else {
              controller.$setValidity('passwordVerify', true);
              return viewValue;
            }
          });
        }
      });
     }
   };
});
