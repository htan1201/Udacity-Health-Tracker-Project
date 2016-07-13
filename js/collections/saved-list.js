//This will define the variable app to an empty object if it is not already defined
var app = app || {};

(function() {
  'use strict';

  // Creates a collection for handling models taht are saved/in the LocalStorage.
  
  var SavedList = Backbone.Collection.extend({
    model: app.Food,

    localStorage: new Backbone.LocalStorage('food-items-backbone'),

    //The following function, totals up the number of calories in the saved list.
    getTotalCalories: function() {
      return this.reduce(function(total, model) {
        return total + model.get('calories');
      }, 0);
    }
  });
  app.savedList = new SavedList();
})();