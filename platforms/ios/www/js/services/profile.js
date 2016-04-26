angular.module('clubinho.services')

.service('Authorization', function($http, $q, $rootScope, $cordovaFacebook, apiConfig) {
  var authorized = false,
    authenticate = function(data, deferred) {
      var deferred = deferred || $q.defer(), 
        request = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'api/auth/generate_auth_cookie/',
          params: {
            insecure: 'cool',
            username: data.username,
            password: data.password
          }
        });

      request.then(function(response) {
        if (response.data.status == 'error') {
          deferred.reject(response.data.error);
        } else {
          localStorage.setItem('username', data.username);
          localStorage.setItem('password', data.password);
          localStorage.setItem('token', response.data.cookie);
          localStorage.setItem('data', JSON.stringify(response.data.user));

          authorized = true;
          deferred.resolve(data);
          $rootScope.$broadcast('user-did-login');
        }
      }, function(response) {
        console.log('Error login', response);
        deferred.reject('Erro');
      });

      return deferred.promise;
    }, createOrLoginFromFacebook = function(accessToken, deferred) {
      return $http.get(apiConfig.baseUrl + 'fb_connect/?access_token=' + accessToken)
        .then(function(response) {
          if (response.data.cookie) {
            localStorage.setItem('token', response.data.cookie);

            authorized = true;
            deferred.resolve(response.data.msg);
          } else {
            deferred.reject(response.data.msg);
          }
        }, function(reason) {
          deferred.reject(reason);
        });
    }, getUserData = function() {
      var deferred = $q.defer();

      $http({
        method: 'get',
        url: apiConfig.baseUrl + 'get_currentuserinfo/',
        params: { 
          cookie: localStorage.getItem('token'),
          insecure: 'cool'
        }
      }).then(function(response) {
        if (response.data.status == 'ok') {
          localStorage.setItem('data', JSON.stringify(response.data.user));
          deferred.resolve(response.data.user)
        } else {
          deferred.reject(response.data.error);
        }
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
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
          method: 'get',
          url: apiConfig.baseUrl + 'api/auth/validate_auth_cookie/',
          params: {
            insecure: 'cool',
            cookie: token
          }
        });

        request.then(function(response) {
          if (response.data.status == 'error' || !response.data.valid) {
            var username = localStorage.getItem('username'),
              password = localStorage.getItem('password'), 
              accessToken = localStorage.getItem('facebookToken');

            // in case of cookie expired
            if (username && password) {
              authenticate({username: username, password: password}, deferred);
            } else if (accessToken) {
              createOrLoginFromFacebook(accessToken, deferred);
            } else {
              deferred.reject();
            }
          } else {
            authorized = true;
            deferred.resolve(true);
            $rootScope.$broadcast('user-did-login');
          }
        }, function(response) {
          deferred.reject();
        });
      }

      return deferred.promise;
    },

    clear: function() {
      ['username', 'password', 'data', 'token', 'facebookToken'].forEach(function(key) {
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
        createOrLoginFromFacebook(accessToken, deferred).then(function() {
          getUserData();
        });        
      }, function(error) {
        console.log('error', error);
        deferred.reject(error);
      });

      return deferred.promise;
    },

    signUp: function(user) {
      var deferred = $q.defer(),
        request = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'insere-responsavel/',
          params: {
            nome: user.name, 
            cpf: user.cpf,
            email: user.email,
            password: user.password,
            endereco: user.address, 
            cep: user.zipcode,
            telefone: user.phone,
            action: 'insere'
          }
        });

      request.then(function(response) {
        if (response.data.status == 'ok') {
          authenticate({username: user.email, password: user.password}, deferred);
        } else {
          deferred.reject(response.data.description);
        }
      }, function(response) {
        deferred.reject();
      });

      return deferred.promise;
    }
  };
})

.service('Profile', function(Authorization, Schedule) {
  var authorized = false,
    methods = {
    getData: function() {
      if (localStorage.getItem('data')) {
        var user = JSON.parse(localStorage.getItem('data'));

        return {
          id: user.id,
          name: user.nickname,
          cpf: user.cpf,
          phone: user.telefone,
          email: user.email,
          address: user.endereco,
          children: JSON.parse(localStorage.getItem('children-list') || '[]')
        }
      }
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
