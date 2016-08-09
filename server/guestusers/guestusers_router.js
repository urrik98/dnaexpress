var guestUserController= require('./guestusers_controller.js');

module.exports = function(app) {

  app.post('/createevent', guestUserController.createEvent);

  app.post('/getevents', guestUserController.getEvents);

  app.post('/sendresponse', guestUserController.sendResponse);


}
