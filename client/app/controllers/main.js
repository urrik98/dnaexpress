angular.module('app.main', ['app.services'])

.controller('MainCtrl', ['$scope', '$state', 'Auth', function($scope, $state, Auth){

  $scope.userIsLive = false;

  $scope.userClicked = function() {
    $scope.userIsLive = true;
  };

  $scope.activateGuestExperience = function() {
    genID();
  }

  function genID() {
    var list = [0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"];
    var ID = "";
    for (var i = 0; i < list.length; i++) {
      ID += list[Math.floor(Math.random() * list.length)]
    }
    console.log(ID);
  }
}]);
