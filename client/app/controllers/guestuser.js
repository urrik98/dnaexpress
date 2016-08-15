angular.module('app.guestuser', ['app.guestuserservices'])

.controller('GuestUserCtrl', ['$scope', '$state', '$window', 'GuestFactory', function($scope, $state, $window, GuestFactory) {

  $scope.showEventsList = true;

  $scope.showFocusEvent = false;

  $scope.showResponseForm = false;

  $scope.toggleFocusEvent = function(event) {
    if(event) {
      $scope.focusEvent = event;
    }
    $scope.showEventsList = false;
    $scope.showFocusEvent = true;
    $scope.showResponseForm = false;
  }

  $scope.toggleEventsList = function() {
    $scope.showEventsList = true;
    $scope.showFocusEvent = false;
    $scope.showResponseForm = false;
  }

  $scope.toggleResponseForm = function() {
    $scope.showEventsList = false;
    $scope.showFocusEvent = false;
    $scope.showResponseForm = true;
  }

  //---------------page behavior scripts above this line, data handling below----------------------

  $scope.focusEvent;

  $scope.responseform;

  var guestUserEventFlag = true;

  var submitResponseFlag = true;

  $scope.guestUserEmail = $window.sessionStorage.getItem('wefeast.guestuser');

  $scope.eventsBin = JSON.parse($window.sessionStorage.getItem('wefeast.guestuserevents')) || [];

  $scope.submitResponse = function(data) {
    console.log("inside submitResponse", data)
    if (submitResponseFlag) {
      submitResponseFlag = false;
      var choices = [];
      for (var key in data) {
        choices.push(key);
      }
      $scope.focusEvent.responded = true;
      $scope.focusEvent.food_choice = choices[0];
      console.log("submit response data", data)
      console.log("$scope.guestUserEmail",$scope.guestUserEmail, "data.hostemail", data.hostemail);
      $scope.focusEvent.email = $scope.guestUserEmail || data.hostemail;
      console.log("$scope.focusEvent.email", $scope.focusEvent.email)
      $window.sessionStorage.removeItem('wefeast.guestuserevents');
      $window.sessionStorage.setItem('wefeast.guestuserevents', JSON.stringify($scope.eventsBin));
      GuestFactory.eventResponse($scope.focusEvent);
      $scope.toggleEventsList();
    }
    submitResponseFlag = true;
  };

  $scope.guestUserEventSubmit = function() {
    if (guestUserEventFlag) {
      guestUserEventFlag = false;
      $scope.guestEvent.publicID = genID();
      $scope.guestEvent.responded = false;
      $scope.eventsBin.push($scope.guestEvent);
      console.log("guestEvent", $scope.guestEvent);
      if (!$window.sessionStorage.getItem('wefeast.guestuser')) {
        $window.sessionStorage.setItem('wefeast.guestuser', $scope.guestEvent.hostemail);
      }
      var dataCache = $scope.guestEvent;
      $window.sessionStorage.removeItem('wefeast.guestuserevents');
      $window.sessionStorage.setItem('wefeast.guestuserevents', JSON.stringify($scope.eventsBin));
      GuestFactory.createEvent(dataCache);
      $state.go('loading')
      $state.go('guestuserdashboard.guestuseroptions.guestusershowevents');
    }
  };

  $scope.setGuestUser = function(user) {
    $window.sessionStorage.removeItem('wefeast.guestuserevents')
    getEvents({email:user});
    if (!$window.sessionStorage.getItem('wefeast.guestuser')) {
      $scope.guestUserEmail = user;
    }
    $window.sessionStorage.setItem('wefeast.guestuser', user);

  };

  function getEvents(data) {
    GuestFactory.getEvents(data);
    $state.go('loading');
  }

  function genID() {
    var ID = "";
    var chars = [1,2,3,4,5,6,7,8,9,0,"a","b","c","d","e","f"];
    for (var i = 0; i < chars.length; i++) {
      ID += chars[Math.floor(Math.random() * chars.length)];
    }
    return ID;
  };

}])
