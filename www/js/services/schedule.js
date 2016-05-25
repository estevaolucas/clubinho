angular.module('clubinho.services')

.service('Schedule', function($http, $q, $sce, apiConfig, CacheFactory) {
  var favKey = 'events-favorited',
    normalize = function(events) {
      return events.map(function(event) {
        event.date = new Date(event.date.replace(/-/g, '/'));

        return event;
      });
    },
    updateCachedList = function(events) {
      var eventsCached = JSON.parse(localStorage.getItem(scheduleStorageKey) || '[]');

      // already exist a saved list?
      if (eventsCached.length) {
        // get events id to be easier to search for new event
        eventsCachedArray = eventsCached.map(function(event) {
          return event.id;
        });

        // seaching for new events to add
        events.forEach(function(event, i, object) {
          if (eventsCachedArray.indexOf(event.id) === -1) {
            eventsCached.push(event);
          } else {
            eventsCached[eventsCachedArray.indexOf(event.id)] = event;
          }
        });
      } else {
        eventsCached = events;
      }

      // cleaning array to be lighter to save
      eventsCached = eventsCached.map(function(event) {
        return {
          id: event.id,
          date: event.date,
          title: event.title,
        }
      });

      // updating array
      localStorage.setItem(scheduleStorageKey, JSON.stringify(eventsCached));

      return events;
    },
    methods = {
      getList: function() {
        var deferred = $q.defer();

        $http.get(apiConfig.baseUrl + '/get-schedule-list').then(function(schedule) {
          deferred.resolve(updateCachedList(normalize(schedule.data.data)));
        }, function(reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
      }, 

      isFavorited: function(event) {
        var favorites = JSON.parse(localStorage.getItem(favKey) || '[]');

        return favorites.indexOf(event.id) != -1
      },

      setFavorite: function(event) {
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

      // get a event the FIRST event from schedule cache that WILL happen TODAY
      getNextEventFromNow: function() {
        var eventsCached = methods.getScheduleFromCache();

        if (eventsCached.length) {
          var now = new Date().getTime(),
            todaysEvents = eventsCached.filter(function(event) {
              // transforming strigified date do Date object again after parse
              event.date = new Date(event.date);

              var eventDate = new Date(event.date).setHours(0, 0, 0, 0);
              return eventDate == new Date().setHours(0, 0, 0, 0);
            }).sort(function(a, b) {
              // ordering events by date asc
              return a.date - b.date;
            }).filter(function(event) {
              // removing past events
              var beginToConfirm = new Date(event.date),
                endToConfirm = new Date(event.date);

              // just allow 1 hour before the event and after 1 hour.
              beginToConfirm.setHours(beginToConfirm.getHours() - 1);
              endToConfirm.setHours(endToConfirm.getHours() + 1);

              return endToConfirm > now && now > beginToConfirm;
            });

          if (todaysEvents.length) {
            return todaysEvents[0];
          }
        }
        
        return null;
      },

      getScheduleFromCache: function() {
        return JSON.parse(localStorage.getItem(scheduleStorageKey) || '[]');
      }
    },
    scheduleStorageKey = 'schedule-cached-list',
    deferred;

  return methods;
});
