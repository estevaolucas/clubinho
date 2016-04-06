angular.module('clubinho.services')

.service('Children', function($http, $q, $rootScope, apiConfig, Profile) {
  var deferred,
    childrenList = [],
    avatars = ['ana', 'luiz', 'maria'],
    normalizeChild = function(child) {
      var avatar = child.custom_fields.avatar[0];

      return {
        name: child.title,
        avatar: child.custom_fields.avatar[0],
        age: child.custom_fields.idade[0],
        points: 50,
        avatar: avatars.indexOf(avatar) == -1 ? avatars[1] : avatar,
        id: child.id
      }
    }
    normalize = function(children) {
      return children.map(function(child) {
        return normalizeChild(child);
      })
    };

  return {
    getList: function() {
      var promise = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'api/get_author_posts/',
          params: {
            post_type: 'filho',
            id: Profile.getData().id,
            cookie: Profile.token(),
          }
        }),
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
      var deferred = $q.defer(),
        promise = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'insere-filho',
          params: {
            id: Profile.getData().id,
            cookie: Profile.token(),
            nome_filho: data.name,
            idade: data.age,
            avatar: data.avatar,
            action: 'insere'
          }
        });

      promise.then(function(response) {
        if (response.data.status == apiConfig.status.error) {
          deferred.reject(response.data.description);
        } else {
          childrenList.unshift(data);
          $rootScope.$broadcast('clubinho-children-update', childrenList);
          deferred.resolve(childrenList);
        }
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    },

    editChild: function(data) {
      var deferred = $q.defer(),
        promise = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'insere-filho/',
          params: {
            id: Profile.getData().id,
            cookie: Profile.token(),
            nome_filho: data.name,
            idade: data.age,
            avatar: data.avatar,
            id_crianca: data.id,
            action: 'edita'
          }
        });

      promise.then(function(response) {
        if (response.data.status == apiConfig.status.error) {
          deferred.reject(response.data.description);
        } else {
          var child = childrenList.filter(function(child) {
              return child.id == data.id;
            })[0];

          if (childrenList.indexOf(child) != -1) {
            childrenList.splice(childrenList.indexOf(child), 1, data);
          }

          $rootScope.$broadcast('clubinho-children-update', childrenList);
          deferred.resolve(childrenList);
        }
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    },

    removeChild: function(data) {
      var deferred = $q.defer(),
        promise = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'insere-filho/',
          params: {
            id: Profile.getData().id,
            cookie: Profile.token(),
            id_crianca: data.id,
            action: 'deleta'
          }
        });

      promise.then(function(response) {
        if (response.data.status == apiConfig.status.error) {
          deferred.reject(response.data.description);
        } else {
          if (childrenList.indexOf(data) != -1) {
            childrenList.splice(childrenList.indexOf(data), 1);
          }

          $rootScope.$broadcast('clubinho-children-update', childrenList);
          deferred.resolve(childrenList);
        }
      }, function(reason) {
        deferred.reject(reason);
      });
      
      return deferred.promise;
    }
  };
});
