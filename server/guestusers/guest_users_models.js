var db = require('../data/db_schema.js');



  var GuestEvent = db.Model.extend({
    tableName:'guestEvents',
    selectedRestaurant: function() {
      return this.hasOne('SelectedRestaurant');
    },
    guestEventInvitees: function() {
      return this.belongsToMany('Event_Invitee');
    }
  });

  var GuestEventInvitee = db.Model.extend({
    tableName:'guestEventInvitees',
    event_invitee: function() {
      this.belongsToMany('Event_Invitee');
    }
  });

  var SelectedRestaurant = db.Model.extend({
    tableName:'selectedRestaurants',
    guestEvent: function() {
      this.belongsToOne('GuestEvent');
    }
  });

  var Event_Invitee = db.Model.extend({
    tableName:'event_invitees',
    guestEvents: function() {
      this.hasMany('GuestEvent');
    },
    GuestEventInvitee: function() {
      this.hasMany('GuestEventInvitee')
    }
  })


module.exports = {
  GuestEvent:GuestEvent,
  GuestEventInvitee:GuestEventInvitee,
  SelectedRestaurant:SelectedRestaurant,
  Event_Invitee
};
