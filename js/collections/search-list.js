//This will define the variable app to an empty object if it is not already defined
var app = app || {};


(function() {
  'use strict';

  // Creates a collection to handle modelst that are generated from search results
  var SearchList = Backbone.Collection.extend({
    model: app.Food
  });
  app.searchList = new SearchList();
})();