//This will define the variable app to an empty object if it is not already defined
var app = app || {};

(function() {
  'use strict';

  // Creates the view for food item as a search result in a list

  app.SearchItemView = Backbone.View.extend({

    //sets the tag it will be rendered in
    tagName: 'li',

    //sets the class name for the item
    className: 'search-list-item',

    //choose which template to be used using underscore.js
    template: _.template($('#search-item-template').html()),

    //sets what are the events for the elements when rendered
    events: {
      'click .save-item': 'select'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    //renders the element to the page
    render: function() {
      this.$el.html(this.template(this.model.attributes));

      return this;
    },

    /**
     * Selects the item on user interaction.
     */
    select: function(event) {
      if (event.type === 'click') {
        // Notify the app that this item was selected.
        app.eventBus.trigger('selectSearchItem', this);
      }
    }
  });
})();