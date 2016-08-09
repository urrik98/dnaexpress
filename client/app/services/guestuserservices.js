angular.module('app.guestuserservices',[])

.factory('GuestFactory', ['$http', '$state', function($http, $state) {

  var genID = function() {
    var ID = "";
    var chars = [1,2,3,4,5,6,7,8,9,0,"a","b","c","d","e","f"];
    for (var i = 0; i < chars.length; i++) {
      ID += chars[Math.floor(Math.random() * chars.length)];
    }
    return ID;
  }

  var createEvent = function(data) {

    data.publicID = genID();
    data.invitees = [];
    for (var key in data) {
      if (/guest/.test(key)) {
        data.invitees.push(data[key]);
      }
    }
    console.log(data)
    return $http({
      url:'/api/guestusers/createevent',
      method:'POST',
      data:data
    })
    .then(function(res) {
      console.log(res)
    })
  }

  return {
    createEvent:createEvent
  }


}])
