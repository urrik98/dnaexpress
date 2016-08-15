angular.module('app.guestuserservices',[])

.factory('GuestFactory', ['$http', '$state', '$window', function($http, $state, $window) {

  var getEvents = function(data) {
    console.log("sent from factory", data)
    return $http({
      url:'api/guestusers/getevents',
      method:'POST',
      data:data
    })
    .then(function(res){
      console.log(res.data.data)
      $window.sessionStorage.setItem('wefeast.guestuserevents', JSON.stringify(res.data.data));
      $state.go('guestuserdashboard.guestuseroptions.guestusershowevents');
    });
  }

  var createEvent = function(data) {
    console.log(data)
    data.invitees = [];
    data.invitees.push(data.hostemail);

    for (var key in data) {
      if (/guest/.test(key) && data[key]) {
        data.invitees.push(data[key]);
      }
    }

    return $http({
      url:'/api/guestusers/createevent',
      method:'POST',
      data:data
    })
    .then(function(res) {
      console.log("response", res.data.data);
    })
  };

  var eventResponse = function(data) {

    return $http({
      url:'api/guestusers/sendresponse',
      method:'POST',
      data:data
    })
    .then(function(res) {
      console.log("response", res);
    })
  }

  return {
    createEvent:createEvent,
    eventResponse:eventResponse,
    getEvents:getEvents
  }


}])
