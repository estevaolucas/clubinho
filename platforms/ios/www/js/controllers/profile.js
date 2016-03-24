angular.module('clubinho.controllers')

.controller('ProfileController', function($scope, $ionicModal, $ionicScrollDelegate, $cordovaDialogs, $rootScope, Children) {
  var createChildModal = function(child) {
    var $childScope = $scope.$new(true);

    $ionicModal.fromTemplateUrl('templates/_children-form.html', {
      scope: $childScope,
      animation: 'slide-in-up',
      controller: 'ChildrenController'
    }).then(function(modal) {
      $childScope.modal = modal;
      $childScope.modal.show();
      $childScope.editing = !!child;
      $childScope.child = child ? angular.copy(child) : {};
    });
  }
  $scope.showChildrenList = true;

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
    createChildModal();
  }

  $scope.editChild = function(child) {
    createChildModal(child);
  }

  $scope.deleteChild = function(child) {
    var title = 'Remover o ' + child.name,
      message = 'Você tem certeza?',
      buttons = ['Cancelar', 'Sim'];

    $cordovaDialogs.confirm(title, message, buttons).then(function(buttonIndex) {
      if (buttonIndex == 2) {
        $rootScope.app.loading = true;

        Children.removeChild(child).then(function() {

        }, function() {
          $cordovaDialogs.alert('Desculpe', 'Não foi possível remover o usuário.', 'OK');
        }).finally(function() {
          $rootScope.app.loading = false;
        });
      }
    })
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

    $ionicScrollDelegate.resize();
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

.controller('ChildrenController', function($scope, $rootScope, $timeout, Children) {
  $scope.save = function() {
    if (form.$invalid) {
      return;
    }

    $rootScope.app.loading = true;

    // creating a child
    if (!$scope.editing) {
      Children.addChild($scope.child).then(function() {
        $scope.modal.remove();
        $rootScope.$broadcast('clubinho-child-added', $scope.child);
      }, function() {
        console.log('ERROR: adding child', child);
      }).finally(function() {
        $rootScope.app.loading = false;
      });
    // editing a child
    } else {
      Children.editChild($scope.child).then(function() {
        $scope.modal.remove();
        $rootScope.$broadcast('clubinho-child-updated', $scope.child);
      }, function() {
        console.log('ERROR: editint child', child);
      }).finally(function() {
        $rootScope.app.loading = false;
      });
    }
  }

  $scope.cancel = function() {
    $scope.modal.remove();
  }
});
