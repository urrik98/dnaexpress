var db = require('../data/db_schema.js');
var models = require('./guest_users_models.js');

var GuestEvents = new db.Collection();
var SelectedRestaurants = new db.Collection();
var GuestEventInvitees = new db.Collection();

GuestEvents.Model = models.GuestEvent;
SelectedRestaurants.Model = models.SelectedRestaurant;
GuestEventInvitees.Model = models.GuestEventInvitee;

module.exports = {
  GuestEvents:GuestEvents,
  SelectedRestaurants:SelectedRestaurants,
  GuestEventInvitees:GuestEventInvitees
};
