angular.module('clubinho.services')

.service('Children', function($http, $q, $rootScope, apiConfig, Profile) {
  var deferred,
    saveList = function(childrenList) {
      localStorage.setItem('children-list', JSON.stringify(childrenList));
      return childrenList;
    },
    normalize = function(children) {
      return children.map(function(child) {
        child.timeline.map(function(timeline) {
          timeline.date = new Date(timeline.date);
          return timeline;
        });

        return child;
      });
    },
    restRequest = function(method, data) {
      var deferred = $q.defer(),
        config = {
          method: method,
          url: apiConfig.baseUrl + '/me/child',
          data: data
        };

      if (method.toLowerCase() != 'post') {
        config.url = config.url + '/' + data.id
      }

      $http(config).then(function(response) {
        $rootScope.$broadcast('clubinho-children-update', response.data.data.children);
        deferred.resolve(saveList(response.data.data.children), response.data.data.message);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    };

  return {
    getList: function(cached) {
      var deferred = deferred || $q.defer(),
        childrenList = JSON.parse(localStorage.getItem('children-list') || '[]');

      deferred.resolve(normalize(childrenList));
      
      return deferred.promise;
    },

    addChild: function(data) {
      return restRequest('POST', data);
    },

    editChild: function(data) {
      return restRequest('PUT', data);
    },

    removeChild: function(data) {
      return restRequest('DELETE', data);
    },

    confirmPresence: function(confirm, event, child) {
      return $http({
        method: 'POSt',
        url: apiConfig.baseUrl + '/me/child/' + child.id + '/confirm/' + event.id
      });
    }
  };
});
