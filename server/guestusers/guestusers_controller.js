var models = require('./guest_users_models.js');
var collections = require('./guest_users_collections.js');
var GuestEvent = models.GuestEvent;
var GuestEvents = collections.GuestEvents;

module.exports = {

  createEvent: function(req, res, next) {
    var event_desc = req.body.event_desc;
    var event_date = req.body.date;
    var creator_email = req.body.host;
    var total_invitees = req.body.invitees.length;
    var location = req.body.location;
    var rsvp_date = req.body.rsvp_date;
    var responded;
    var publicID = req.body.publicID;

    new GuestEvent({publicID:publicID})
      .fetch()
      .then(function(guestevent) {
        if (!guestevent) {
          var newGuestEvent = new GuestEvent({
            event_desc: event_desc,
            creator_email:creator_email,
            location: location,
            publicID:publicID,
            total_invitees:total_invitees,
            event_date:event_date,
            rsvp_date:rsvp_date
          });
          newGuestEvent.save()
          .then(function(newGuestEvent) {
            var guestinvitee = new models.GuestEventInvitee({
              email:creator_email,
              guestEvents_id: newGuestEvent.id
            })
            .save()
            .then(function(entry) {
              console.log(entry)
            });
            req.body.invitees.map(function(invitee) {
              var guestInvitee = new models.GuestEventInvitee({
                email:invitee,
                guestEvents_id: newGuestEvent.id
              })
              guestInvitee.save()
              .then(function(guestInvitee){
                //send emails with event publicID,
              })
              .catch(function(err) {
                console.error("error in saving guest invitees to table", err);
              })
            })
          })
          .catch(function(error) {
            console.error("Error in guestusers_controller createEvent", error)
          })
        }
      })
      .catch(function(error) {
        console.error("Error in guestusers_controller createEvent", error);
      })


  },

  getEvents: function(req, res, next) {


  },

  sendResponse: function(req, res, next) {


  }

}
