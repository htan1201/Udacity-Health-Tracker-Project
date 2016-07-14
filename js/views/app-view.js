var app = app || {};

(function() {
  'use strict';

  /**
   * Creates a view for the entire app.
   */
  app.AppView = Backbone.View.extend({
    //chooses the id of the element
    el: '#health-tracker-app',

    //sets what are the events for the elements when rendered
    events: {
      'keypress #search-box': 'searchUserInput',
      'focus #search-box': 'resetInputFeedback',
      'click #search-button': 'searchUserInput',
      'click #search-result-close-btn': 'searchResultCloseButtonClick'
    },

    //feedback strings to be rendered into the input placeholder
    searchFeedbackStrings: {
      Initial: 'Enter the food that you consumed',
      Search_In_Progress: 'Search in progress',
      Fail_Attempt: 'Sorry, there is a network error',
      No_Input: 'Enter the food that you consumed'
    },

    initialize: function() {

      this.focusNewView = false;

      this.$jqXHR = null;

      //select the elements on the rendered elements
      this.$searchInput = this.$('#search-box');
      this.$searchList = this.$('#search-list');
      this.$searchListContainer = this.$('#search-result-list');
      this.$searchListCloseButton = this.$('#search-result-close-btn');
      this.$savedList = this.$('#saved-list');
      this.$savedListContainer = this.$('#saved-food-list');
      this.$calorieTotal = this.$('#total-calories');

      //the initial text to be placed into the placeholder
      this.$searchInput.prop('placeholder', this.searchFeedbackStrings.Initial);

      //listening to the elements that have events and do the functions when it has interactions
      this.listenTo(app.searchList, 'remove', this.removeSearchResultList);
      this.listenTo(app.savedList, 'add', this.addSavedItem);
      this.listenTo(app.savedList, 'update', this.renderTotalCalories);
      // this.listenTo(app.savedList, 'remove', this.focusLastItem);
      this.listenTo(app.savedList, 'reset', this.renderTotalCalories);
      this.listenTo(app.eventBus, 'selectSearchItem', this.selectSearchItem);

      var self = this;
      this.fetching = true;

      //fetch the models from the list that has been saved
      app.savedList.fetch({success: function() {
                              self.fetching = false;
                              // self.filterTodaysItems();
                            }
                          });
    },

    //redner the total calories from the list
    renderTotalCalories: function() {
      this.$calorieTotal.text(app.savedList.getTotalCalories().toFixed());
    },

    //adds a view to the saved item for the food that is selected
    addSavedItem: function(foodItem) {
      var self = this;

      if (!this.fetching) {
        var view = new app.SavedItemView({model: foodItem});
        var $el = view.render().$el;

        $el.hide();
        this.$savedList.append($el);

        $el.show(300, function() {
          if (self.focusNewView) {
            this.focus();
            self.focusNewView = false;
          }
        });
      }
    },

    searchUserInput: function(event) {
      if (event.which === app.ENTER_KEY || event.type === 'click') {
        var value = this.$searchInput.val().trim();

        if (value) {
          this.removeSearchResultList();

          this.nutritionixAPIQuery(value);

          // Give feedback to the user that search is in progress.
          this.$searchInput.val('');
          this.$searchInput.prop('placeholder',
                                 this.searchFeedbackStrings.Search_In_Progress);
          this.$searchInput.prop('disabled', true);
        } else {
          // Give feedback that user goofed input.
          this.$searchInput.parent().addClass('has-error');
          this.$searchInput.prop('placeholder',
                                 this.searchFeedbackStrings.No_Input);
        }
      } else {
        //clears the feedback in the search box placeholder
        //this point is where the user is typing. Hence, we need to clear the feedback
        this.resetInputFeedback();
      }
    },

    //resets the feedback in the search box placeholder
    resetInputFeedback: function(event) {
      this.$searchInput.parent().removeClass('has-error');
    },

    //
    nutritionixAPIQuery: function(value) {
      var self = this;

      // Query the health API.
      this.$jqXHR = $.ajax({
                        url: 'https://api.nutritionix.com/v1_1/search/' + value,
                        dataType: 'json',
                        data: {
                          appId: '30fc0f57',
                          appKey: '847b2a751b496a8e6e8c3a2d4f5bc20d',
                          results: '0:20',
                          fields: '*'
                        }
                    })
                    .done(function(data, status, jqXHR) {
                      console.log('ajax is done');
                      if (!data.hits) console.warn('no hits');

                      self.createSearchResultList(data.hits);
                      self.$savedListContainer.hide();

                      // Reset the input field.
                      self.$searchInput.prop('disabled', false);
                      self.$searchInput.prop(
                          'placeholder', self.searchFeedbackStrings.Initial);

                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                      console.log('ajax failed');

                      self.$searchInput.prop('disabled', false);

                      // Give feedback to user.
                      self.$searchInput.parent().addClass('has-error');
                      self.$searchInput.prop(
                          'placeholder', self.searchFeedbackStrings.Fail_Attempt);
                    });
    },

    //Creates Search result as a list and displays the search result
    createSearchResultList: function(results) {
      // Sort by brand as we add models.
      app.searchList.comparator = 'brand';

      // Add a model for each result.
      results.forEach(function(result) {
          var fields = result.fields;

          app.searchList.add(new app.Food({
              name: fields.item_name,
              brand: fields.brand_name,
              calories: fields.nf_calories,
              serving_size_qty: fields.nf_serving_size_qty,
              serving_size_unit: fields.nf_serving_size_unit
          }));
      });
      this.showSearchResult();
    },

    //shows the search result into the list
    showSearchResult: function() {
      // Add a view for each model.
      _.each(app.searchList.models, this.addSearchItemView, this);

      // Show the list if it's currently hidden.
      if (this.$searchListContainer.css('display') === 'none') {
        this.$searchListContainer.show();
      }

      // Put focus into the dialog
      this.$searchListCloseButton.focus();
    },

    //creates a view for searched item and append it into the element on the list.
    addSearchItemView: function(foodItem) {
      var view = new app.SearchItemView({model: foodItem});
      this.$searchList.append(view.render().$el);
    },

    //handles user selection of the food and add it into the saved list.
    selectSearchItem: function(view) {
      // Focus to the list to indciate the change to screen readers
      this.focusNewView = true;

      // Remove the model from the search list.
      var model = app.searchList.remove(view.model);

      // Add the model to the saved list.
      model.set('timestamp', Date.now());
      app.savedList.create(model);

      //remove the search result list
      this.removeSearchResultList();

    },

    //removes the search result list from the page
    removeSearchResultList: function() {
      app.searchList.reset();
      this.$searchList.empty();
      this.$searchListContainer.hide();

      this.$savedListContainer.show();
    },

    //closes the search result list upon click
    searchResultCloseButtonClick: function(event) {
      this.removeSearchResultList();

      // Move the focus somewhere meaningful.
      this.$searchInput.focus();
    }

  });

})();