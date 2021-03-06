var Events = require('./../data/collections/events');
var Event = require('./../data/models/event');
var UserEvents = require('../data/collections/user_events');
var UserEvent = require('../data/models/user_event');
var Users = require('./../data/collections/users');
var User = require('./../data/models/user');
var UserEventsFoods = require('../data/collections/user_events_foods');
var UserEventsFood = require('../data/models/user_events_food');
var userEventServices = require('../services/user_event_services');
var FoodServices = require('../services/food_services');
var MailServer = require('../mail_server/mail_server');
var searchControls = require('./../search/search_controller');

module.exports = eventControls = {
  createEvent: function(req, res, next) {
    var name = req.body.eventName;
    var date = req.body.date;
    var creator = req.body.creator;
    var attendees = (req.body.attendees).concat(creator);
    var location = req.body.location;

    User
    .forge({username: creator})
    .fetch().then(function(user){
      Event.forge({
        name: name,
        date: date,
        creator: user.attributes.id,
        attendeesNum: attendees.length,
        responded: 0,
        status: 'active',
        location: location
      })
      .save()
      .then(function(newEvent){
        return eventControls.connectEventUsers(attendees, newEvent, res, next)
        .then(function() {
          return user.getEvents(req, res, next)
          .then(function(usersEvents) {
            res.status(200).send(usersEvents);
            return;
          })
          .then(function() {
            eventControls.mailUsers(attendees, creator, 'eventAlert');
          })
          .catch(function (err) {
            return next(new Error('error creating event' + error));
          });
        })
      })
    });
  },

  deleteEvent: function () {

  },

  formSubmission: function (req, res, next) {
    var pubEventId = req.body.pubEventId;
    var username  = req.body.username;
    var prefs = req.body.prefs;
    var searchDetails = {location:'', restrictions: [], userFoodPrefs: [], eventId: null};

    eventControls.getUserModelByUsername(username)
      .then(function (user) {
        eventControls.getEventModelByPubId(pubEventId)
          .then(function (event) {
            searchDetails.eventId = event.attributes.id;
            searchDetails.location = event.attributes.location;
            // update the number of responded attendees ;
              // will be used below to check if all attendees have completed foodPref forms
            var attendeesNum = event.get('attendeesNum');
            var responded = event.get('responded') + 1;
            event.save('responded', responded);

            eventControls.getUserEventModel(user.attributes.id, event.attributes.id)
            .then(function (userEvent) {
              // set users resp status for event to true,
              // so that sever and client know they have completed form
              userEvent.save('responseStatus', 1);
            // uesrEventModel links a user and event, used to get user and event info, and users prefs for specific event
            UserEventServices.addEventUserFoodPrefs(userEvent, prefs);
            })
            .then(function () {
              // if all users have responded, collect all of their pref data and generate list of recommendations!
              if (attendeesNum === responded) {
                return eventControls.getPrefsForAllAttendees(searchDetails.eventId)
                  .then(function(allUserPrefs) {
                    // format food Prefs into and array of arrays for the algorithm
                    allUserPrefs.forEach(function(userPrefs) {
                      searchDetails.restrictions.push(userPrefs.restrictions)
                      searchDetails.userFoodPrefs.push([userPrefs.profileFoodPrefs, userPrefs.eventFoodPrefs]);
                    });
                  })
                  .then(function () {
                     // send to search controller, which will: run details through foodtype selection algorthim, make requests to yelp, and save top suggestions in db
                    searchControls.getEventRecommendations(searchDetails, event);
                  })
                  .then(function() {
                    // fetch all of current user's events and respond
                    return user.getEvents()
                      .then(function(events) {
                        res.status(200).send(events);
                      })
                  }).catch(function(error) {
                    return next(new Error('failure in form submission handling: ' + error));
                  });
              } else {
                return user.getEvents()
                  .then(function(events) {
                    res.status(200).send(events);
                  });
              }
            })
            .catch(function(error) {
              return next(new Error('failure in form submission handling: ' + error));
            });
          })

      })
  },

  getPrefsForAllAttendees: function(eventId) {
    return eventControls.getAllUserEventsForEvent(eventId)
      .then(function(eventsUserEvents) {
        var result = eventsUserEvents.map(function(currUserEvent) {
          return eventControls.getDataForGeneratingRecs(currUserEvent)
            .then(function(userPrefs) {
              return userPrefs;
            });
        });
        return Promise.all(result)
      })
  },

  getUserEventModel: function (userId, eventId) {
    return UserEvent
      .forge()
      .query(function(qb){
        qb.where('user_id', '=', userId).andWhere('event_id', '=', eventId);
      })
      .fetch()
      .then(function (userevent) {
        return userevent;
      });
  },

  deleteUserEventModel: function (userId, eventId) {
    return UserEvent
      .forge()
      .query(function(qb){
        qb.where('user_id', '=', userId).andWhere('event_id', '=', eventId);
      })
      .destroy()
      .then(function (userevent) {
        //console.log('userevent', userevent);
      });
  },

  getUserModelByUsername: function (username) {
    return User
      .forge({username: username})
      .fetch()
      .then(function (user) {
        return user;
    });
  },

  getEventModelByPubId: function (pubEventId) {
    return Event
      .forge({publicEventId: pubEventId})
      .fetch()
      .then(function (event) {
        return event;
      });
  },

  getAllUserEventsForEvent: function (eventId) {
    return UserEvent
      .forge()
      .query('where', 'event_id', '=', eventId)
      .fetchAll()
      .then(function (userEvent) {
        return userEvent.models;
      });
  },

  getDataForGeneratingRecs: function (userEvent) {
    var allUserPrefs = {};
    return User.forge({id: userEvent.attributes.user_id})
      .fetch()
      .then(function (user) {
          return foodServices.getProfileFoodPrefs(user)
          .then(function (profileFoodArray) {
            allUserPrefs.profileFoodPrefs = profileFoodArray;
          })
          .then(function(){
            return dietServices.getDietRestrictions(user)
              .then(function(restrictions) {
                allUserPrefs.restrictions = restrictions;
              })
              .then(function() {
                return UserEventServices.getUserEventsFoodPrefs(userEvent)
                  .then(function(eventFoodArray) {
                    allUserPrefs.eventFoodPrefs = eventFoodArray;
                    return allUserPrefs;
                  });
              });
          });
      });
  },

  getEvent: function(eventId) {
    return Event
      .forge({id: eventId})
      .fetch()
      .then(function (event) {
        return event.attributes;
      });
  },

  getUsersEvents: function(req, res, next) {
    User
      .forge({username: req.body.username})
      .fetch()
      .then(function(user) {
        if (!user) {
          next(new Error('user not foundd'));
        } else {
          user.getEvents()
            .then(function(events) {
              res.status(200).send(events);
            })
        }
      })
      .catch(function(error) {
        next(new Error('error in getUsersEvents in events controller' + error));
      })
  },

  connectEventUsers: function (attendees, event, res, next) {
    var result = attendees.map(function (username) {
      return new User({username: username})
        .fetch()
        .then(function(user){
          if (user) {
            return new UserEvent({
              user_id: user.attributes.id,
              event_id: event.attributes.id,
              responseStatus: 0
            })
            .save()
            .then(function (eventuser) {
              if (!eventuser) {
                return next(new Error('failed to find user in user table when attempting to create an event'));
              }
              return eventuser;
            })
          } else {
            return next(new Error('failed to find user in user table when attempting to create an event'));
          }
        });
    });
    return Promise.all(result);
  },

  selectRestaurant: function (req, res, next) {
    var creator = req.body.creator;
    var pubEventId = req.body.pubEventId;
    var selection = req.body.restaurant;

    Event
      .forge({publicEventId: pubEventId})
      .fetch()
      .then(function(event) {
        event.saveSelection(selection);
        return event;
      })
      .then(function(event) {
        User.forge({username: creator})
          .fetch()
          .then(function(user) {
            user.getEvents(req, res, next)
              .then(function(events) {
                res.status(200).send(events);
                UserEvent
                  .query('where', 'event_id', '=', event.attributes.id)
                  .fetchAll()
                  .then(function (userevents) {
                    Promise.all(userevents.map(function (userevent) {
                      return User
                        .query('where', 'id', '=', userevent.attributes.user_id)
                        .fetch()
                        .then(function (user) {
                          return user.attributes.username;
                        });
                    })).then(function (attendees) {
                      eventControls.mailUsers(attendees, creator, 'recommendationAlert', event.attributes.name);
                    }).catch(function (err) {
                      console.error('Failed to send email', err);
                    });
                  });
              });
          });
      });
  },

  mailUsers: function (attendees, creator, template) {
   return Promise.all(attendees.map(function (attendee) {
     return User
     .forge({username: attendee})
     .fetch()
     .then(function (user) {
       return user.attributes.email;
     });
   }))
   .then(function (emailList) {
     emailList = emailList.join(', ');
     MailServer.mail(creator, template, emailList);
   });
 },

  declineEvent: function (req, res, next) {
    var username = req.body.username;
    var pubId = req.body.pubId;

    User
      .forge({username: username})
      .fetch()
      .then(function (user) {
        Event
          .forge({publicEventId: pubId})
          .fetch()
          .then(function (event) {
            event.save({attendeesNum: event.attributes.attendeesNum - 1})
            .then(function () {
              return eventControls.deleteUserEventModel(user.attributes.id, event.attributes.id)
            })
            .then(function (model) {
              // if they were they were the last person to rsvp, the search for recommendtions should be triggered
              if (event.attributes.responded === event.attributes.attendeesNum) {
                var searchDetails = {location: event.attributes.location, restrictions: [], userFoodPrefs: [], eventId: event.attributes.id};
                return eventControls.getPrefsForAllAttendees(searchDetails.eventId)
                  .then(function(allUserPrefs) {
                    // format food Prefs into and array of arrays for the algorithm
                    allUserPrefs.forEach(function(userPrefs) {
                      searchDetails.restrictions.push(userPrefs.restrictions)
                      searchDetails.userFoodPrefs.push([userPrefs.profileFoodPrefs, userPrefs.eventFoodPrefs]);
                    });
                  })
                  .then(function () {
                    // send to search controller, which will: run details through foodtype selection algorthim, make requests to yelp, and save top suggestions in db
                    searchControls.getEventRecommendations(searchDetails, event);
                  })
              }

              user.getEvents()
                .then(function(events) {
                  res.status(200).send(events);
              }).catch(function (err) {
                return next(new Error('Failed to decline user invitation: ' + error));
              });

            }).catch(function (err) {
              return next(new Error('Failed to decline user invitation: ' + error));
            });
          });

      });
  }

};
