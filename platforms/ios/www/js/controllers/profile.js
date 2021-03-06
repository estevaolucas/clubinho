angular.module('clubinho.controllers')

.controller('ProfileController', function($scope, $ionicModal, $ionicScrollDelegate, $cordovaDialogs, $rootScope, Children, Authorization, ionicToast, Profile) {
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
  
  $scope.data = Profile.getData();

  $scope.close = function(e) {
    var $elem = $(e.target);

    if ($elem.is('header') || $elem.is('.close')) {
      $scope.modal.hide(); 
    }
  }

  $scope.logout = function() {
    Authorization.clear();
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
      buttons = ['Sim', 'Cancelar'];

    $cordovaDialogs.confirm(title, message, buttons).then(function(buttonIndex) {
      if (buttonIndex == 1) {
        $rootScope.app.showLoading();

        Children.removeChild(child).then(function() {
          ionicToast.show('Criança deletada com sucesso.', 'top', false, 2500);
        }, function() {
          ionicToast.show('Não foi possível deletar a criança.', 'top', false, 2500);
        }).finally(function() {
          $rootScope.app.hideLoading();
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

.controller('EditProfileController', function($scope, $timeout, $rootScope, ionicToast) {
  $scope.update = function(form) {
    if (form.$invalid) {
      return;
    }

    $rootScope.app.showLoading();

    Profile.updateData(angular.copy($scope.data)).then(function(data) {
      $scope.modal.remove();
      $rootScope.$broadcast('clubinho-profile-updated', data);
      ionicToast.show('Dados atualizados com sucesso', 'top', false, 2500);
    }, function(response) {
      if (response.data.data && response.data.data.params) {
        for(var error in response.data.data.params) {
          ionicToast.show(response.data.data.params[error], 'top', false, 2500);
        };
      } else if(response.data.message) {
        ionicToast.show(response.data.message, 'top', false, 2500);
      } else {
        ionicToast.show('Não foi possível alterar seus dados.', 'top', false, 2500);
      }
    }).finally(function() {
      $rootScope.app.hideLoading();
    });
  }

  $scope.cancel = function(e) {
    var $elem = $(e.target);

    if ($elem.is('ion-modal-view') || $elem.is('.btn.btn-cancel')) {
      $scope.modal.remove(); 
    }
  }
})

.controller('ChildrenController', function($scope, $rootScope, $timeout, Children, ionicToast) {
  $scope.save = function() {
    if (form.$invalid) {
      return;
    }

    $rootScope.app.showLoading();

    // creating a child
    if (!$scope.editing) {
      Children.addChild($scope.child).then(function() {
        $scope.modal.remove();
        $rootScope.$broadcast('clubinho-child-added', $scope.child);

        ionicToast.show('Criança adicionada com sucesso.', 'top', false, 2500);
      }, function() {
        ionicToast.show('Não foi possivel adicionar a criança.', 'top', false, 2500);
      }).finally(function() {
        $rootScope.app.hideLoading();
      });
    // editing a child
    } else {
      Children.editChild($scope.child).then(function() {
        $scope.modal.remove();
        $rootScope.$broadcast('clubinho-child-updated', $scope.child);

        ionicToast.show('Criança editada com sucesso.', 'top', false, 2500);
      }, function() {
        ionicToast.show('Não foi possivel editar criança', 'top', false, 2500);
      }).finally(function() {
        $rootScope.app.hideLoading();
      });
    }
  }

  $scope.cancel = function(e) {
    var $elem = $(e.target);

    if ($elem.is('ion-modal-view') || $elem.is('.btn.btn-cancel')) {
      $scope.modal.remove(); 
    }
  }
});
