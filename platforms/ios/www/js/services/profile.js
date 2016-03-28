angular.module('clubinho.services')

.service('Authorization', function($http, $q, $rootScope, apiConfig) {
  var authorized = false;

  return {
    authorized: function() {
      if (!authorized) {
        var username = localStorage.getItem('username'),
          password = localStorage.getItem('password');

        authorized = username && password;
      }

      return authorized;
    },

    clear: function() {
      localStorage.removeItem('username');
      localStorage.removeItem('password');

      $rootScope.$broadcast('user-did-logout');

      authorized = false
    },

    go: function(data) {
      delete $http.defaults.headers.common['X-Requested-With'];

      var deferred = $q.defer(), 
        request = $http({
          method: 'get',
          url: 'mockup/login.json',
          // url: apiConfig.baseUrl + 'auth/generate_auth_cookie/',
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
        console.log(response);
        deferred.reject('Erro');
      });

      return deferred.promise;
    }
  };
})

.service('Profile', function(Authorization) {
  var authorized = false;

  return {
    getData: function() {
      if (Authorization.authorized()) {
        return JSON.parse(localStorage.getItem('data'));
      }
    }
  };
})
