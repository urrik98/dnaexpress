var path = require('path');

var db = require('knex')({
  client: 'pg',
  connection: {
    // host: process.env.DB_HOST,
    // database: process.env.DB_DATABASE,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // port: process.env.DB_PORT,
    // ssl: process.env.DB_SSL
    host     : '127.0.0.1',
    user     : 'adamrenschen',
    password : 'Deathtongue',
    database : 'wefeastapp',
    port     : '5432'
  },
  searchPath: 'knex,public',
  useNullAsDefault: true
});

db.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('username', 100).unique();
      user.string('email', 100).unique();
      user.string('password', 100);
      user.string('salt', 100);
      user.string('firstname', 50);
      user.string('lastname', 50);
      user.string('location', 100);
      user.string('status');
      user.timestamps();
    }).then(function () {
      console.log('Created users table');
    });
  }
});

db.schema.hasTable('events').then(function(exists) {
  if (!exists) {
    db.schema.createTable('events', function(event) {
      event.increments('id').primary();
      event.string('name', 50);
      event.date('date');
      event.integer('creator').references('users.id');
      event.integer('attendeesNum');
      event.integer('responded');
      event.integer('selectedRestaurant');
      event.string('publicEventId').unique();
      event.string('location');
      event.string('status');
      event.timestamps();
    }).then(function (table) {
      console.log('Created events table');
    });
  }
});

db.schema.hasTable('friends').then(function(exists) {
  if (!exists) {
    db.schema.createTable('friends', function(friendship) {
      friendship.increments('id').primary();
      friendship.integer('user_id').references('users.id');
      friendship.integer('friend_id').references('users.id');
    }).then(function () {
      console.log('Created friends table');
    });
  }
});

db.schema.hasTable('userEvents').then(function(exists) {
  if (!exists) {
    db.schema.createTable('userEvents', function(userEvent) {
      userEvent.increments('id').primary();
      userEvent.integer('user_id').references('users.id');
      userEvent.integer('event_id').references('events.id');
      userEvent.boolean('responseStatus');
    }).then(function (table) {
      console.log('Created userEvents table');
    });
  }
});

db.schema.hasTable('userEventsFood').then(function(exists){
  if (!exists) {
    db.schema.createTable('userEventsFood', function(userEventFood){
      userEventFood.increments('id').primary();
      userEventFood.integer('userEvent_id').references('userEvents.id');
      userEventFood.integer('foodType_id').references('foodTypes.id');
    }).then(function (table) {
      console.log('Created userEventsFood table');
    });
  }
});

db.schema.hasTable('recommendations').then(function(exists){
  if (!exists) {
    db.schema.createTable('recommendations', function(recommendation){
      recommendation.increments('id').primary();
      recommendation.integer('event_id').references('events.id');
      recommendation.string('name');
      recommendation.string('address');
      recommendation.string('city');
      recommendation.string('phone');
      recommendation.string('rating_img_url');
      recommendation.string('snippet_image_url');
      recommendation.string('url');
      recommendation.string('userVotes');
      recommendation.string('image_url');
    }).then(function (table) {
      console.log('Created recommendations table');
    });
  }
});

db.schema.hasTable('foodTypes').then(function(exists) {
  if (!exists) {
    db.schema.createTable('foodTypes', function(food) {
      food.increments('id').primary();
      food.string('type', 50);
    }).then(function () {
      var autoPop = require('./presets/auto_pop_tables');
      autoPop.addFoodTypes();
      console.log('Created foodTypes table and populated preset data');
    });
  }
});

db.schema.hasTable('userProfileFoodPrefs').then(function(exists) {
  if (!exists) {
    db.schema.createTable('userProfileFoodPrefs', function(profFoodPrefs) {
      profFoodPrefs.increments('id').primary();
      profFoodPrefs.integer('user_id').references('users.id');
      profFoodPrefs.integer('foodType_id').references('foodTypes.id');
    }).then(function () {
      console.log('Created userProfileFoodPrefs table');
    });
  }
});

db.schema.hasTable('dietRestricts').then(function(exists) {
  if (!exists) {
    db.schema.createTable('dietRestricts', function(restricts) {
      restricts.increments('id').primary();
      restricts.string('type', 50);
    }).then(function () {
      var autoPop = require('./presets/auto_pop_tables');
      autoPop.addDietRestrictions();
      console.log('Created dietRestricts table and populated preset data');
    });
  }
});

db.schema.hasTable('userDietRestricts').then(function(exists) {
  if (!exists) {
    db.schema.createTable('userDietRestricts', function(userRestricts) {
      userRestricts.increments('id').primary();
      userRestricts.integer('user_id').references('users.id');
      userRestricts.integer('dietRestrict_id').references('dietRestricts.id');
    }).then(function () {
      console.log('Created userDietRestricts table');
    });
  }
});

db.schema.hasTable('eventSuggestions').then(function(exists) {
  if (!exists) {
    db.schema.createTable('eventSuggestions', function(suggestion) {
      suggestion.increments('id').primary();
      suggestion.integer('event_id').references('events.id');;
      suggestion.string('suggestion', 50);
    }).then(function () {
      console.log('Created eventSuggestions table');
    });
  }
});

db.schema.hasTable('guestEvents').then(function(exists) {
  if (!exists) {
    db.schema.createTable('guestEvents', function(guestEvent) {
      guestEvent.increments('id').primary();
      guestEvent.string('publicID', 20);
      guestEvent.string('creator_email', 30);
      guestEvent.string('creator_name', 50);
      guestEvent.string('datetime', 30);
      guestEvent.string('location', 30);
      guestEvent.string('event_date');
      guestEvent.string('rsvp_date', 30);
      guestEvent.integer('selectedRestaurant_id').references('selectedRestaurants.id');
      guestEvent.string('final_food_choice', 30);
      guestEvent.string('event_desc', 100);
      guestEvent.integer('number_invited', 2);
      guestEvent.integer('number_responded', 2);
    }).then(function () {
      console.log('Created guestEvents table');
    });
  }
});

db.schema.hasTable('guestEventInvitees').then(function(exists) {
  if (!exists) {
    db.schema.createTable('guestEventInvitees', function(guestEventInvitee) {
      guestEventInvitee.increments('id').primary();
      guestEventInvitee.string('email', 30);
    }).then(function () {
      console.log('Created guestEventInvitees table');
    });
  }
});


db.schema.hasTable('selectedRestaurants').then(function(exists) {
  if (!exists) {
    db.schema.createTable('selectedRestaurants', function(selectedRestaurant) {
      selectedRestaurant.increments('id').primary();
      selectedRestaurant.string('name', 50);
      selectedRestaurant.string('address', 75);
      selectedRestaurant.string('city', 50);
      selectedRestaurant.string('phone', 15);
      selectedRestaurant.string('business_url', 200);
      selectedRestaurant.string('rating_url', 200);
      selectedRestaurant.string('thumbnail_url', 200);
      selectedRestaurant.string('snippet_image_url', 200);
    }).then(function () {
      console.log('Created selectedRestaurants table');
    });
  }
});

db.schema.hasTable('event_invitees').then(function(exists) {
  if (!exists) {
    db.schema.createTable('event_invitees', function(event_invitee){
      event_invitee.increments('id').primary();
      event_invitee.integer('guestEvents_id').references('guestEvents.id');
      event_invitee.integer('guestEventInvitee_id').references('guestEventInvitees.id');
      event_invitee.boolean('responded', 5);
      event_invitee.string('food_choice', 20);
      event_invitee.string('publicID', 25);
      event_invitee.boolean('restaurant_is_selected', 5);
      event_invitee.integer('selectedRestaurant_id',5).references('selectedRestaurants.id');
    }).then(function(){
      console.log('Created event_invitees junction table');
    });
  }
});

var bookshelf = require('bookshelf')(db);
module.exports = bookshelf;

var User = require('./models/user');
bookshelf.model('User', User);
var Event = require('./models/event');
bookshelf.model('Event', Event);
