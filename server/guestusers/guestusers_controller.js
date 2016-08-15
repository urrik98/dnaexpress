var models = require('./guest_users_models.js');
var collections = require('./guest_users_collections.js');
var GuestEvent = models.GuestEvent;
var GuestEvents = collections.GuestEvents;
var GuestEventInvitee = models.GuestEventInvitee;
var Event_Invitee = models.Event_Invitee;
var SelectedRestaurant = models.SelectedRestaurant;
var Yelp = require('yelp');
var yelp = new Yelp({
  consumer_key:'ju7T0GatX3G3terGQa8qAg',
  consumer_secret:'xxqTDZc8wGUxCcvzxgaVaRKeGY8',
  token:'gTsZIinUjEwsPzCcaA_CXLzjN4WSiZOO',
  token_secret:'D4W6WFkDcsxrADvwLMcv3ZrDJdA'
});
module.exports = {

  createEvent: function(req, res, next) {
    var event_desc = req.body.event_desc;
    var event_date = req.body.event_date;
    var creator_email = req.body.hostemail;
    var creator_name = req.body.hostname;
    var total_invitees = req.body.invitees.length;
    var invitees = req.body.invitees;
    var location = req.body.location;
    var rsvp_date = req.body.rsvp_date;
    var number_responded = 0;
    var publicID = req.body.publicID;
    var event_id;
    var final_food_choice = null;

    new GuestEvent({publicID:publicID})     //create event entry
      .fetch()
      .then(function(guestevent) {
        if (!guestevent) {
          var newGuestEvent = new GuestEvent({
            event_desc:event_desc,
            creator_email:creator_email,
            creator_name:creator_name,
            location:location,
            publicID:publicID,
            event_date:event_date,
            rsvp_date:rsvp_date,
            final_food_choice:final_food_choice,
            number_responded:number_responded,
            number_invited:total_invitees
          });
          newGuestEvent.save()
          .then(function(nge){
            event_id = nge.id;
            console.log("event primary key",nge.id)
            var arrayOfInvitees = invitees.map(saveInvitees);
            Promise.all(arrayOfInvitees).then(function(savedInvitees) {
              console.log("saved Invitees",savedInvitees);
              var junctionTableEntries = savedInvitees.map(saveJctnTableEntries);
              Promise.all(junctionTableEntries).then(function(savedjtes) {
                console.log("savedjtes",savedjtes);
                res.status(200).json({message:"Event successfully created"});
              })
              .catch(function(error){
                console.error("Error in saving junction table entries",error)
              })
            })
          })
          .catch(function(error) {
            console.error("Error in Saving GuestEvent",error)
          });
        }
      })
      .catch(function(error) {
        console.error("Error in guestusers_controller createEvent", error);
      });

      //helper functions

      function saveInvitees(name) {
        if (!name || name === '') {
          console.log("empty name", name);
          return;
        }
        var promise = new Promise(function(resolve, reject){
          GuestEventInvitee.forge({email:name})
          .fetch()
          .then(function(inv){
            if (!inv) {
              GuestEventInvitee.forge({email:name})
              .save()
              .then(function(model) {
                resolve(model)
              })
            }
            else {
              resolve(inv)
            }
          })
        })
        return promise;
      }

      function saveJctnTableEntries(guest) {
        console.log("jctntable input",guest)
        if (!guest || guest === ''){
          console.log("undefined jctn input", guest);
          return;
        }
        var promise = new Promise(function(resolve, reject){
          console.log("inside event_invitee promise event_id = ", event_id);
          Event_Invitee.forge({guestEventInvitee_id:guest.attributes.id, guestEvents_id:event_id, responded:false, food_choice:null, publicID:publicID, restaurant_is_selected:false})
          .save()
          .then(function(model) {
            resolve(model);
          })
        })
        return promise;
      };
  },

  getEvents: function(req, res, next) {
    console.log("inside getEvents controller function", req.body);
    var eventsToReturn = [];

    GuestEventInvitee.where({email:req.body.email})
    .fetch()
    .then(function(invitee){
      Event_Invitee.where({guestEventInvitee_id:invitee.id})
      .fetchAll()
      .then(function(collection) {
        var inviteeEventsData = collection.map(fetchGuestEvent)
        Promise.all(inviteeEventsData)
        .then(function(data){
          res.status(200).json({data:data});
        })
      })
    })
    .catch(function(err) {
      console.error(err);
    });

    //helper function accesses GuestEvent table and returns data for each event

    function fetchGuestEvent(model) {
      console.log("line 141",model)
      var promise = new Promise(function(resolve, reject){
        GuestEvent.where({id:model.attributes.guestEvents_id})
        .fetch()
        .then(function(guestEvent) {
          var eventData = {
              publicID:guestEvent.attributes.publicID,
              hostname:guestEvent.attributes.creator_name,
              event_date:guestEvent.attributes.event_date,
              rsvp_date:guestEvent.attributes.rsvp_date,
              location:guestEvent.attributes.location,
              event_desc:guestEvent.attributes.event_desc,
              food_choice:model.attributes.food_choice,
              responded:model.attributes.responded,
            };
            if (model.attributes.restaurant_is_selected === true) {
              console.log("model.restaurant_is_selected")
              SelectedRestaurant.where({id:model.attributes.selectedRestaurant_id})
              .fetch()
              .then(function(restaurant) {
                eventData.selectedRestaurant = restaurant;
                resolve(eventData);
              })
            }
            else {
                resolve(eventData);
            }

        })
      })
      return promise;
    };

  },

  sendResponse: function(req, res, next) {
    console.log("data sent to sendResponse", req.body)
    var publicID = req.body.publicID;
    var email = req.body.email;
    var food_choice = req.body.food_choice;
    var responded = req.body.responded;

    GuestEventInvitee.where({email:email})
    .fetch()
    .then(function(invitee){
      console.log("line 166", invitee)
      Event_Invitee.where({guestEventInvitee_id:invitee.id, publicID:publicID})
      .fetch()
      .then(function(model){
        console.log("model before update", model)
        model.save({responded:true, food_choice:food_choice}, {patch:true})
        .then(function(savedModel){
          console.log("model after update",savedModel)
          GuestEvent.where({id:savedModel.attributes.guestEvents_id})
          .fetch()
          .then(function(event) {
            console.log("event model", event);
            event.save({number_responded:event.attributes.number_responded + 1}, {patch:true})
            .then(function(savedEvent){
              console.log("savedEvent after food_choice is registered", savedEvent)
              if (savedEvent.attributes.number_responded >= savedEvent.attributes.number_invited && savedEvent.attributes.selectedRestaurant_id === null) {
                console.log("responses equal invitations");
                selectRestaurant(savedEvent);
                //retrieve all food_choices and run algorithm then store result in savedModel
              }
            })
          })
        })
      })
      .catch(function(error){
        console.error("Error in updating invitation");
      });
    });

    //helper functions

    function selectRestaurant(event) {
      console.log("inside selectRestaurant", event);
      Event_Invitee.where({guestEvents_id:event.attributes.id})
      .fetchAll()
      .then(function(collection){
        console.log("collection of returned event_invitee models to grab food choices from", collection)
        var choices = collection.models.map(getFood_Choices);
        Promise.all(choices)
        .then(function(allChoices){
          console.log("all food choices from Event_Invitee table",allChoices);
          runRestaurantQuery(allChoices, event.attributes.location, event.attributes.id);
        })
      })
    };

    function getFood_Choices(model) {
      console.log("model.attributes", model.attributes)
      var promise = new Promise(function(resolve, reject) {
        resolve(model.attributes.food_choice);
      })
      return promise;
    };

    function runRestaurantQuery(foods, location, eventID) {
      console.log("inside runRestaurantQuery", foods, location)
      var hash = {};
      var top_choice;
      var yelp_results;
      // var final_choice;
      foods.forEach(function(food){
        if (hash[food]) {
          hash[food]++;
        }
        else {
          hash[food] = 1;
        }
      });
      for (var key in hash) {
        if (!top_choice || hash[key] > top_choice[1]) {
          top_choice = [key, hash[key]];
        }
      }
      console.log("inside runRestaurantQuery", top_choice);
      yelp.search({category_filter:'restaurants',searchTerm:top_choice[0], location:location})
      .then(function(yelpData) {
        yelp_results = yelpData.businesses;
        var final_choice = yelp_results[Math.floor(Math.random() * yelp_results.length)];
        console.log("inside chained then statement after yelp call", final_choice);
        SelectedRestaurant.forge({name:final_choice.name,address:final_choice.location.address[0],city:final_choice.location.city,phone:final_choice.display_phone,business_url:final_choice.url,rating_url:final_choice.rating_img_url,thumbnail_url:final_choice.image_url,snippet_image_url:final_choice.snippet_text})
        .save()
        .then(function(sr) {
          console.log("saved restaurant in table", sr)
          GuestEvent.where({id:eventID})
          .fetch()
          .then(function(ge) {
            ge.save({selectedRestaurant_id:sr.attributes.id, final_food_choice:top_choice[0]}, {patch:true})
            .then(function(savedge) {
              console.log("guestEvent after saving restaurant", savedge)
              Event_Invitee.where({guestEvents_id:savedge.attributes.id})
              .fetchAll()
              .then(function(eicollection) {
                console.log("event_invitee collection after saving restaurant in guest event",eicollection)
                eicollection.models.forEach(function(model) {
                  model.save({restaurant_is_selected:true, selectedRestaurant_id:sr.attributes.id}, {patch:true})
                  .then(function(m) {
                    console.log("updated event_invitee to reflect restaurant is selected", m)
                  })
                })
                res.status(200).json({message:"Restaurant is Selected"})
              })
            })
          })
        })
        //selection algorithm
        //save to guestEvents
        //update event_invitees restaurant_is_selected field
      })
      .catch(function(error) {
        console.error("Error in getting Yelp results",error)
      })



    };

  }



}
