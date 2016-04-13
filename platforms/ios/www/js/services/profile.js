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
      
      $cordovaFacebook.logout()

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
            cep: user.cep
            telefone: user.phone
            insecure: 'cool',
            cookie: token
          }
        });

      request.then(function(response) {
        if (response.data.status != 'error') {
          authenticate({username: data.email, password: user.password}, deferred);
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

.service('Profile', function(Authorization) {
  var authorized = false;

  return {
    getData: function() {
      if (localStorage.getItem('data')) {
        return JSON.parse(localStorage.getItem('data'));
      }
    },

    token: function() {
      if (localStorage.getItem('token')) {
        return localStorage.getItem('token');
      }

      return false;
    }
  }
})
