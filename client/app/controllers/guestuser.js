angular.module('app.guestuser', ['app.guestuserservices'])

.controller('GuestUserCtrl', ['$scope', '$state', '$window', 'GuestFactory', function($scope, $state, $window, GuestFactory) {

  $scope.showFocusEvent = false;

  $scope.focusEvent;

  $scope.toggleFocusEvent = function(event) {
    console.log("ping")
    $scope.focusEvent = event;
    if (!$scope.showFocusEvent) {
      $scope.showFocusEvent = true;
    }
    else {
      $scope.showFocusEvent = false;
    }
  }

  $scope.guestUserEventSubmit = function() {
    GuestFactory.createEvent($scope.guestEvent);
  };

  $scope.eventsBin;

  setInterval(function() {
    $scope.eventsBin = null;
    $scope.eventsBin = JSON.parse($window.sessionStorage.getItem('wefeast.guestuserevents'));
    console.log("$scope.eventsBin", $scope.eventsBin);
  }, 5000);


}])
