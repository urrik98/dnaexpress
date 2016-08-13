var db = require('../data/db_schema.js');
var models = require('./guest_users_models.js');

var GuestEvents = new db.Collection();
var SelectedRestaurants = new db.Collection();
var GuestEventInvitees = new db.Collection();
var Event_Invitees = new db.Collection();

GuestEvents.Model = models.GuestEvent;
SelectedRestaurants.Model = models.SelectedRestaurant;
GuestEventInvitees.Model = models.GuestEventInvitee;
Event_Invitees.Model = models.Event_Invitee;

module.exports = {
  GuestEvents:GuestEvents,
  SelectedRestaurants:SelectedRestaurants,
  GuestEventInvitees:GuestEventInvitees,
  Event_Invitees:Event_Invitees
};
