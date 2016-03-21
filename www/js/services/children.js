angular.module('clubinho.services')

.service('Children', function($http, $q) {
  var deferred;

  return {
    getList: function() {
      var promise = $http.get('mockup/children.json'),
        deferred = deferred || $q.defer();

      promise.then(function(children) {
        deferred.resolve(children);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }
  };
});
