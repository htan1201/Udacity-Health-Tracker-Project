//This will define the variable app to an empty object if it is not already defined
var app = app || {};

//the following defines the 'Enter_key' CR decimal code
app.ENTER_KEY = 13;

$(function() {
  'use strict';

  app.eventBus = _.extend(Backbone.Events);

  // Start the app.
  console.log('starting the app');
  app.appView = new app.AppView();
});