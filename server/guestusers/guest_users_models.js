var db = require('../data/db_schema.js');



  var GuestEvent = db.Model.extend({
    tableName:'guestEvents',
    selectedRestaurant: function() {
      return this.hasOne('SelectedRestaurant');
    },
    guestEventInvitees: function() {
      return this.hasMany('GuestEventInvitee');
    }
  });

  var GuestEventInvitee = db.Model.extend({
    tableName:'guestEventInvitees',
    guestEventEventInvitee: function() {
      this.belongsToOne('GuestEvent')
    }
  });

  var SelectedRestaurant = db.Model.extend({
    tableName: 'guestEventRestaurants',
    guestEvent: function() {
      this.belongsToOne('GuestEvent');
    }
  });


module.exports = {
  GuestEvent:GuestEvent,
  GuestEventInvitee:GuestEventInvitee,
  SelectedRestaurant:SelectedRestaurant
};
