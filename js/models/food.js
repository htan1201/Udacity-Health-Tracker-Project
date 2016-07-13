//This will define the variable app to an empty object if it is not already defined
var app = app || {};

(function() {
  'use strict';
  //this will create a default model for the food
  app.Food = Backbone.Model.extend({
    //the following are the default key value pairs for the food
    defaults: {
      name: '',
      brand: '',
      calories: '',
      serving_size_qty: null,
      serving_size_unit: null
    }
  });
})();