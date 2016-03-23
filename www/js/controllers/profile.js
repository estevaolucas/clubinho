angular.module('clubinho.controllers')

.controller('ProfileController', function($scope, $ionicModal, Children) {
  $scope.showChildrenList = false;

  $scope.data = {
    name: 'Estevão Lucas',
    cpf: '016.788.888-72',
    phone: '61 9211-1011',
    email: 'estevaolucas@gmail.com',
    address: 'QNS 12 - J - 12'
  };

  $scope.toggleChildrenList = function () {
    $scope.showChildrenList = !$scope.showChildrenList;
  }

  $scope.close = function() {
    $scope.modal.hide();
  }

  $scope.edit = function() {
    var $editScope = $scope.$new(true);

    $ionicModal.fromTemplateUrl('templates/_profile-edit.html', {
      scope: $editScope,
      animation: 'slide-in-up',
      controller: 'EditProfileController'
    }).then(function(modal) {
      $editScope.modal = modal;
      $editScope.data = angular.copy($scope.data);

      modal.show();
    });
  }

  $scope.addChild = function() {
    var $addChildScope = $scope.$new(true);

    $ionicModal.fromTemplateUrl('templates/_children-add.html', {
      scope: $addChildScope,
      animation: 'slide-in-up',
      controller: 'AddChildrenController'
    }).then(function(modal) {
      $addChildScope.modal = modal;
      $addChildScope.modal.show();
    });
  }

  Children.getList().then(function(children) {
    $scope.children = children;
  });

  // profile updated
  $scope.$on('clubinho-profile-updated', function(e, data) {
    $scope.data = data;
  });

  // children list updated
  $scope.$on('clubinho-children-update', function(e, children) {
    $scope.children = children;
  });
})

.controller('EditProfileController', function($scope, $timeout, $rootScope) {
  $scope.update = function(form) {
    if (form.$invalid) {
      return;
    }

    $rootScope.app.loading = true;

    // FIXME: update from API
    $timeout(function(form) {
      $scope.modal.remove();
      $rootScope.$broadcast('clubinho-profile-updated', $scope.data);
      $rootScope.app.loading = false;
    }, 1000);
  }

  $scope.cancel = function() {
    $scope.modal.remove()
  }
})

.controller('AddChildrenController', function($scope, $rootScope, $timeout, Children) {
  $scope.child = {};

  $scope.save = function() {
    if (form.$invalid) {
      return;
    }

    $rootScope.app.loading = true;

    Children.addChild($scope.child).then(function() {
      $scope.modal.remove();
      $rootScope.$broadcast('clubinho-child-added', $scope.child);
    }, function() {
      console.log('ERROR: adding child', child);
    }).finally(function() {
      $rootScope.app.loading = false;
    });
  }

  $scope.cancel = function() {
    $scope.modal.remove();
  }
});
