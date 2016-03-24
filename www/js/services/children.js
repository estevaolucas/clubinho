angular.module('clubinho.services')

.service('Children', function($http, $q, $rootScope) {
  var deferred,
    childrenList = [];

  return {
    getList: function() {
      var promise = $http.get('mockup/children.json'),
        deferred = deferred || $q.defer();

      promise.then(function(children) {
        childrenList = children.data;

        deferred.resolve(children.data);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    },

    addChild: function(data) {
      var deferred = $q.defer();

      childrenList.push({
        "name": data.name,
        "age": 11,
        "points": 0,
        "avatar": "ana",
        "events": []
      });

      $rootScope.$broadcast('clubinho-children-update', childrenList);
      deferred.resolve(childrenList);
      
      return deferred.promise;
    },

    editChild: function(data) {
      var deferred = $q.defer();

      $rootScope.$broadcast('clubinho-children-update', childrenList);
      deferred.resolve(childrenList);
      
      return deferred.promise;
    },

    removeChild: function(data) {
      var deferred = $q.defer();

      if (childrenList.indexOf(data) != -1) {
        childrenList.splice(childrenList.indexOf(data), 1);
      }

      $rootScope.$broadcast('clubinho-children-update', childrenList);
      deferred.resolve(childrenList);
      
      return deferred.promise;
    }
  };
});
