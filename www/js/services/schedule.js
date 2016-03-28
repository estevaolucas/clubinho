angular.module('clubinho.services')

.service('Schedule', function($http, $q, $sce, apiConfig) {
  var favKey = 'events-favorited',
    isFavorited = function(event) {
      var favorites = JSON.parse(localStorage.getItem(favKey) || '[]');

      return favorites.indexOf(event.id) != -1
    },
    setFavorite = function(event) {
      var favorites = JSON.parse(localStorage.getItem(favKey) || '[]'),
        setted = false;

      if (favorites.indexOf(event.id) == -1) {
        favorites.push(event.id);
        setted = true;
      } else {
        favorites.splice(favorites.indexOf(event.id), 1);
      }

      localStorage.setItem(favKey, JSON.stringify(favorites));

      return setted;
    },
    normalize = function(events) {
      return events.map(function(event) {
        var date = event.custom_fields.data_evento[0],
          hour = event.custom_fields.horario_evento[0],
          parts = [date.substring(0, 4), date.substring(4, 6), date.substring(6,8)];

        hour = hour.length == 2 ? hour + ':00' : hour;

        event.date = new Date(parts.join('/') + ' ' + hour);
        
        event.excerpt = $sce.trustAsHtml(event.excerpt);
        event.content = $sce.trustAsHtml(event.content);
        event.favorite = isFavorited(event);
        return event;
      });
    }, deferred;

  return {
    getList: function() {
      // var promise = $http.get(apiConfig.baseUrl + 'mockup/schedule.json'),
      var promise = $http.get('mockup/schedule.json'),
        deferred = deferred || $q.defer();

      promise.then(function(schedule) {
        if (schedule.data.status == apiConfig.status.success) {
          deferred.resolve(normalize(schedule.data.posts));
        } else {
          deferred.reject(apiConfig.error);  
        }
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }, 

    isFavorited: isFavorited,

    setFavorite: setFavorite
  };
});
