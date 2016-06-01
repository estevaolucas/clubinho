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

      if (data.facebook_user && !data.cpf) {
        $rootScope.$broadcast('user-did-facebook-signup');  
        return;
      }

      $rootScope.$broadcast('user-did-login');
    },
    authenticate = function(data, deferred) {
      var deferred = deferred || $q.defer();

      $http({
        method: 'POST',
        url: apiConfig.baseUrl + '/token',
        data: data
      }).then(function(response) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', data.password);

        proccessLogin(response, deferred);
      }, function(response) {
        var error = response.data.message;

        if (response.data.code == 'jwt_auth_failed') {
          error = 'E-mail e/ou senha incorretos';
        }

        deferred.reject(error);
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
        $http.post(apiConfig.baseUrl + '/token/validate').then(function(response) {
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
        localStorage.setItem('facebookToken', accessToken);
        createOrLoginFromFacebook(accessToken, deferred);
      }, function(error) {
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
        proccessLogin(response, deferred);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
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
        }),
        saved = false;
        
      if (eventsArray.indexOf(eventToAdd.id) === -1) {
        events.push({
          id: eventToAdd.id,
          children: methods.getData().children.map(function(child) {
            return { 
              id: child.id,
              confirmed: false
            }
          })
        });

        saved = true;
      }

      methods._saveEventsToConfirm(events);

      return saved;
    },

    // remove an event from the list of events to confirm presence
    removeEventToConfirm: function(eventToRemove, child) {
      var events = methods.eventsToConfirm(true),
        eventsArray = events.map(function(event) {
          return event.id;
        }),
        index = eventsArray.indexOf(eventToRemove.id);
        
      if (index !== -1) {
        var event = events[index],
          children = event.children.map(function(child) {
            return child.id;
          });

        if (children.indexOf(child.id) !== -1) {
          event.children[children.indexOf(child.id)].confirmed = true;
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

        // events = events.filter(function(event) {
        //   var children = event.children.filter(function(child) {
        //       return !child.confirmed;
        //     });

        //   return children.length
        // });

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

    eventAvailableToConfirm: function() {
      var eventsToConfirm = methods.eventsToConfirm(true, true),
        now = new Date(), 
        events = eventsToConfirm.filter(function(event) {
          var endToConfirm = new Date(event.date);

          endToConfirm.setHours(endToConfirm.getHours() + 1);

          return now < endToConfirm;
        });

      if (events.length) {
        return events[0]
      };

      return false;
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
