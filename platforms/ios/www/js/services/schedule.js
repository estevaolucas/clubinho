angular.module('clubinho.services')

.service('Schedule', function($http, $q) {
  var deferred;

  return {
    getList: function() {
      var promise = $http.get('mockup/schedule.json'),
        deferred = deferred || $q.defer();

      promise.then(function(schedule) {
        deferred.resolve(schedule.data);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }, 

    saveShedule: function(schedule) {

    }
  };
});
