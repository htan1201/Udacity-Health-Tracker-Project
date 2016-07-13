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
      'keypress #search-input': 'searchUserInput',
      'focus #search-input': 'resetInputFeedback',
      'click #search-btn': 'searchUserInput',
      'click #search-list-close-btn': 'searchCloseButtonClick'
    },

    //feedback strings to be rendered into the input placeholder
    searchFeedbackStrings: {
      DEFAULT: 'Enter the food that you consumed',
      Search_In_Progress: 'Search in progress',
      Fail_Attempt: 'Sorry, there is a network error',
      EMPTY_INPUT: 'Enter the food that you consumed'
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

      //default text to be placed into the placeholder
      this.$searchInput.prop('placeholder', this.searchFeedbackStrings.DEFAULT);

      //listening to the elements that have events and do the functions when it has interactions
      this.listenTo(app.searchList, 'remove', this.removeSearchList);
      this.listenTo(app.savedList, 'add', this.addSavedItem);
      this.listenTo(app.savedList, 'update', this.renderCalorieTotal);
      // this.listenTo(app.savedList, 'remove', this.focusLastItem);
      this.listenTo(app.savedList, 'reset', this.renderTotalCalories);
      this.listenTo(app.eventBus, 'selectSearchItem', this.selectSearchItem);

      var self = this;
      this.fetching = true;

      //fetch the models from the list that has been saved
      app.savedList.fetch({success: function() {
                              self.fetching = false;
                              self.filterTodaysItems();
                            }
                          });
    },

    //redner the total calories from the list
    renderTotalCalories: function() {
      this.$calorieTotal.text(app.savedList.getCalorieTotal().toFixed());
    },

    /**
     * Adds a view for the provided food item model.
     */
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
          this.removeSearchList();

          this.queryHealthAPI(value);

          // Give feedback to the user that search is in progress.
          this.$searchInput.val('');
          this.$searchInput.prop('placeholder',
                                 this.searchFeedbackStrings.AJAX_IN_PROGRESS);
          this.$searchInput.prop('disabled', true);
        } else {
          // Give feedback that user goofed input.
          this.$searchInput.parent().addClass('has-error');
          this.$searchInput.prop('placeholder',
                                 this.searchFeedbackStrings.EMPTY_INPUT);
        }
      } else {
        // User is typing, so clear out any existing feedback.
        this.resetInputFeedback();
      }
    },

    resetInputFeedback: function(event) {
      this.$searchInput.parent().removeClass('has-error');
    },