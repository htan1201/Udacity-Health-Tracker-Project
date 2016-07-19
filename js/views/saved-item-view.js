//This will define the variable app to an empty object if it is not already defined
var app = app || {};

(function() {
  'use strict';

  // Creates the view for the food items shtat are saved into the LocalStorage
  app.SavedItemView = Backbone.View.extend({

    //sets the tag it will be rendered in
    tagName: 'tr',

    //sets thte class name for the item
    className: 'saved-list-item',

    //choose which template to be used using underscore.js
    template: _.template($('#saved-item-template').html()),

    //sets what are the events for the elements when rendered
    events: {
      'click .remove-item': 'removeMe'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    //render function that renders the element to the page
    render: function() {
      this.$el.html(this.template(this.model.attributes));

      return this;
    },

    //the following function is used to remove the items from the list
    removeMe: function() {
      var self = this;

      // destroys the model when the user decided to remove the item from the saved list
      this.model.destroy({success: function(model, response) {
          self.remove();
      }});
    }

  });
})();