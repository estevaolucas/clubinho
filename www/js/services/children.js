angular.module('clubinho.services')

.service('Children', function($http, $q, $rootScope) {
  var deferred,
    childrenList = [],
    avatars = ['ana', 'luiz', 'maria'],
    normalizeChild = function(child) {
      var newChild = {};

      newChild.name   = child.title;
      newChild.avatar = child.custom_fields.avatar[0];
      newChild.age    = child.custom_fields.idade[0];
      newChild.points = 50;

      newChild.avatar = avatars.indexOf(newChild.avatar) == -1 ? avatars[1] : newChild.avatar;

      return newChild;
    }
    normalize = function(children) {
      return children.map(function(child) {
        return normalizeChild(child);
      })
    };

  return {
    getList: function() {
      var promise = $http.get('mockup/children.json'),
        deferred = deferred || $q.defer();

      promise.then(function(children) {
        childrenList = normalize(children.data.posts);

        deferred.resolve(childrenList);
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
