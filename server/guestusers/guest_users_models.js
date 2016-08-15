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
    },
    event_invitee: function() {
      this.belongsMany('Event_Invitee');
    }
  });

  var Event_Invitee = db.Model.extend({
    tableName:'event_invitees',
    guestEvents: function() {
      this.hasMany('GuestEvent');
    },
    guestEventInvitee: function() {
      this.hasMany('GuestEventInvitee')
    },
    selectedRestaurant: function() {
      this.hasOne('SelectedRestaurant')
    }

  })


module.exports = {
  GuestEvent:GuestEvent,
  GuestEventInvitee:GuestEventInvitee,
  SelectedRestaurant:SelectedRestaurant,
  Event_Invitee
};
