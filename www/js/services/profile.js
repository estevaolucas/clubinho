angular.module('clubinho.services')

.service('Authorization', function($http, $q, $rootScope, $cordovaFacebook, apiConfig) {
  var authorized = false,
    proccessLogin = function(response, deferred) {
      var children = response.data.data.children,
        data = response.data.data;

      delete data.children;

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      delete data.token;
      localStorage.setItem('data', JSON.stringify(data));
      localStorage.setItem('children-list', JSON.stringify(children));

      authorized = true;
      deferred.resolve(data);
      $rootScope.$broadcast('user-did-login');
    },
    authenticate = function(data, deferred) {
      var deferred = deferred || $q.defer(), 
        request = $http({
          method: 'post',
          url: apiConfig.baseUrl + '/token',
          data: {
            username: data.username,
            password: data.password
          }
        });

      request.then(function(response) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', data.password);

        proccessLogin(response, deferred);
      }, function(response) {
        console.log('Error login', response);
        deferred.reject('Erro');
      });

      return deferred.promise;
    }, createOrLoginFromFacebook = function(accessToken, deferred) {
      return $http({
          method: 'post', 
          url: apiConfig.baseUrl + '/facebook',
          data: {
            access_token: accessToken
          }
        })
        .then(function(response) {
          proccessLogin(response, deferred);
        }, function(reason) {
          deferred.reject(reason);
        });
    }

  return {
    authorized: function() {
      var token = localStorage.getItem('token'),
        deferred = $q.defer();

      if (authorized) {
        deferred.resolve(true);
      } else if (!token) {
        deferred.reject(); 
      } else {
        var request = $http({
          method: 'post',
          url: apiConfig.baseUrl + '/token/validate'
        });

        request.then(function(response) {
          $http.get(apiConfig.baseUrl + '/me').then(function(response) {
            proccessLogin(response, deferred);
          }, function(response) {
            deferred.reject(response);    
          });
        }, function(response) {
          var username = localStorage.getItem('username'),
            password = localStorage.getItem('password'), 
            accessToken = localStorage.getItem('facebookToken');

          // in case of cookie expired
          if (username && password) {
            authenticate({username: username, password: password}, deferred);
          } else if (accessToken) {
            createOrLoginFromFacebook(accessToken, deferred);
          } else {
            deferred.reject(response);
          }
        });
      }

      return deferred.promise;
    },

    clear: function() {
      var keys = ['username', 'password', 'data', 'token', 'facebookToken', 'children-list'];
      keys.forEach(function(key) {
        localStorage.removeItem(key);
      });
      
      $cordovaFacebook.logout();

      $rootScope.$broadcast('user-did-logout');
      authorized = false
    },

    go: authenticate,

    facebook: function() {
      var deferred = $q.defer();

      $cordovaFacebook.login(['public_profile', 'email']).then(function(response) {
        var accessToken = response.authResponse.accessToken;
        console.log(accessToken);
        localStorage.setItem('facebookToken', accessToken);
        createOrLoginFromFacebook(accessToken, deferred);
      }, function(error) {
        console.log('error', error);
        deferred.reject(error);
      });

      return deferred.promise;
    },

    signUp: function(user) {
      var deferred = $q.defer();
      
      $http({
        method: 'POST',
        url: apiConfig.baseUrl + '/create-user',
        data: user
      }).then(function(response) {
        authenticate({username: user.email, password: user.password}, deferred);
      }, function(response) {
        deferred.reject(response);
      });

      return deferred.promise;
    },

    forgotPassword: function(email) {
      return $http({
        method: 'POST',
        url: apiConfig.baseUrl + '/forgot-password',
        data: {
          email: email
        }
      });
    }
  };
})

.service('Profile', function(Authorization, Schedule, $q, $http, apiConfig) {
  var authorized = false,
    methods = {
    getData: function() {
      var user = JSON.parse(localStorage.getItem('data') || '[]');

      user.children = JSON.parse(localStorage.getItem('children-list') || '[]');

      return user;
    },

    updateData: function(data) {
      var deferred = $q.defer();
      
      delete data.children;

      for (key in data) {
        if (data[key] == null) {
          delete data[key];
        }
      }

      $http({
        method: 'POST',
        url: apiConfig.baseUrl + '/me',
        data: data
      }).then(function(response) {
        var data = response.data.data;

        delete data.children;

        localStorage.setItem('data', JSON.stringify(data));
      
        deferred.resolve(data);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    },

    // user's session cookie to login
    token: function() {
      if (localStorage.getItem('token')) {
        return localStorage.getItem('token');
      }

      return false;
    },

    // add an event to the list of events to confirm presence
    addEventToConfirm: function(eventToAdd) {
      var events = methods.eventsToConfirm(true),
        eventsArray = events.map(function(event) {
          return event.id;
        });
        
      if (eventsArray.indexOf(eventToAdd.id) === -1) {
        events.push({
          id: eventToAdd.id,
          children: methods.getData().children.map(function(child) {
            return child.id
          })
        });
      }

      methods._saveEventsToConfirm(events);
    },

    // remove an event from the list of events to confirm presence
    removeEventToConfirm: function(eventToRemove, child) {
      var events = methods.eventsToConfirm(true),
        eventsArray = events.map(function(event) {
          return event.id;
        }),
        index = eventsArray.indexOf(eventToRemove.id);
        
      console.log('index', index);

      if (index !== -1) {
        var event = events[index];

        console.log('event', event);
        if (event.children.length) {
          if (event.children.indexOf(child.id) !== -1) {
            event.children.splice(event.children.indexOf(child.id), 1)

            if (!event.children.length) {
              events.splice(index, 1);
            }
          }
        } else {
          events.splice(index, 1);  
        }
      }

      methods._saveEventsToConfirm(events);
    },

    // list events from the list. Opcionaly list just from the current user
    eventsToConfirm: function(justCurrentUser, detailedList) {
      var usersEvents = JSON.parse(localStorage.getItem(methods.eventsToConfirmKey) || '{}');

      if (justCurrentUser) {
        var userId = 'user-' + methods.getData().id,
          events = usersEvents[userId] ? usersEvents[userId] : [],
          eventsArray = events.map(function(event) {
            return event.id;
          });

        if (detailedList) {
          var eventsFromCache = Schedule.getScheduleFromCache();

          return eventsFromCache.filter(function(event) {
            return eventsArray.indexOf(event.id) !== -1
          }).map(function(event) {
            return angular.extend(event, events[eventsArray.indexOf(event.id)]);
          });
        }

        return events;
      }

      return usersEvents;
    },

    _saveEventsToConfirm: function(events) {
      var eventsToConfirm = methods.eventsToConfirm();

      eventsToConfirm['user-' + methods.getData().id] = events;

      localStorage.setItem(methods.eventsToConfirmKey, JSON.stringify(eventsToConfirm));
    },

    eventsToConfirmKey: 'events-to-confirm'
  };

  window.Profile = methods;
  return methods;
})
