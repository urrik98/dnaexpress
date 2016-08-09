angular.module('app.guestuser', ['app.guestuserservices'])

.controller('GuestUserCtrl', ['$scope', 'GuestFactory', function($scope, GuestFactory) {

  $scope.guestUserEventSubmit = function() {
    console.log("inside guestuser controller", $scope.guestEvent);
    GuestFactory.createEvent($scope.guestEvent);
  }




}])
