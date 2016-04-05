angular.module('clubinho.services')

.service('Authorization', function($http, $q, $rootScope, apiConfig) {
  var authorized = false,
    authenticate = function(data) {
      var deferred = $q.defer(), 
        request = $http({
          method: 'get',
          url: apiConfig.baseUrl + 'auth/generate_auth_cookie/',
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

          $rootScope.$broadcast('user-did-login');

          authorized = true;
          deferred.resolve(data);
        }
      }, function(response) {
        console.log('Error login', response);
        deferred.reject('Erro');
      });

      return deferred.promise;
    };

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
          url: apiConfig.baseUrl + '/auth/validate_auth_cookie/',
          params: {
            insecure: 'cool',
            cookie: token
          }
        });

        request.then(function(response) {
          if (response.data.status == 'error' || !response.data.valid) {
            var username = localStorage.getItem('username'),
              password = localStorage.getItem('password');

            // in case of cookie expired
            if (username && password) {
              return authenticate({
                username: username,
                password: password
              });
            }

            deferred.reject();
          } else {
            $rootScope.$broadcast('user-did-login');

            authorized = true;
            deferred.resolve(true);
          }
        }, function(response) {
          deferred.reject();
        });
      }

      return deferred.promise;
    },

    clear: function() {
      ['username', 'password', 'data', 'token'].forEach(function(key) {
        localStorage.removeItem(key);
      });
      
      $rootScope.$broadcast('user-did-logout');
      authorized = false
    },

    go: authenticate
  };
})

.service('Profile', function(Authorization) {
  var authorized = false;

  return {
    getData: function() {
      if (localStorage.getItem('data')) {
        return JSON.parse(localStorage.getItem('data'));
      }
    }
  };
})
