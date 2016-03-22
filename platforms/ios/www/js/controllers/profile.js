angular.module('clubinho.controllers')

.controller('ProfileController', function($scope) {
  var data = {
    name: 'Estevão Lucas',
    cpf: '016.788.888-72',
    phone: '61 9211-1011',
    email: 'estevaolucas@gmail.com',
    address: 'QNS 12 - J - 12'
  };

  $scope.profileCtrl = {
    isEditing: false,
    data: data,
    loading: false
  }

  $scope.close = function() {
    $scope.profile.hide();
  }

  $scope.edit = function() {
    $scope.profileCtrl.isEditing = !$scope.profileCtrl.isEditing;
    $scope.editData = angular.copy($scope.profileCtrl.data);
  }
})

.controller('EditProfileController', function($scope, $timeout) {

  $scope.update = function(data) {
    $scope.$parent.profileCtrl.loading = true;

    // FIXME: update from API
    $timeout(function() {
      $scope.$parent.profileCtrl.isEditing = false;
      $scope.$parent.profileCtrl.data = $scope.editData;

      $scope.$parent.profileCtrl.loading = false;
    }, 1000);
  }

  $scope.cancel = function() {
    $scope.$parent.profileCtrl.isEditing = false;
  }
});
