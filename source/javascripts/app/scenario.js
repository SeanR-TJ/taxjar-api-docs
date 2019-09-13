(function (global) {
  'use strict';

  var scenarioPicker = {
    defaultOption: '<option>United States</option>',
    customResponseLanguages: ['ruby', 'python', 'go'],

    init: function() {
      var that = this;

      $('blockquote:contains("Request Scenario:")').each(function() {
        var scenarioName = that.getScenarioName(this);
        var requestHeader = that.getPreviousHeader(this, 'Request Example');
        var responseHeader = that.getNextHeader(this, 'Response Example');
        var responseScenarioHeader = that.getNextHeader(this, 'Response Scenario: ' + scenarioName);

        if (requestHeader.find('[data-default]').length) {
          that.defaultOption = '<option>' + requestHeader.find('span').data('default') + '</option>';
        }

        // Add select dropdown if none
        if (!requestHeader.find('.scenarios').length) {
          that.createPicker(requestHeader, responseHeader);
        }

        // Add scenario to dropdown list
        requestHeader.find('select').append('<option>' + scenarioName + '</option>');

        // Hide scenario headers
        $(this).hide();
        responseScenarioHeader.hide();

        // Hide scenario request examples
        $(this).nextUntil('blockquote').hide();
      });
    },
    getScenarioName: function(header) {
      return $(header).find('.scenario').text().split(': ')[1];
    },
    getScenarioDescription: function(header) {
      return $(header).find('.scenario-desc').html();
    },
    getPreviousHeader: function(header, text) {
      return $(header).prevAll('blockquote:contains("' + text + '"):first');
    },
    getNextHeader: function(header, text) {
      return $(header).nextAll('blockquote:contains("' + text + '"):first');
    },
    createPicker: function(requestHeader, responseHeader) {
      var requestExamples = requestHeader.nextUntil('blockquote:contains("Response Example")');
      var responseExamples = responseHeader.nextUntil('.content > p');
      var that = this;

      requestHeader.append('<div class="scenarios"><select>' + this.defaultOption + '</select></div>');

      requestHeader.find('select').on('change', function(e) {
        that.switchScenario(e, {
          requestHeader: requestHeader,
          requestExamples: requestExamples,
          responseHeader: responseHeader,
          responseExamples: responseExamples
        });
      });
    },
    switchScenario: function(e, dom) {
      var currentLanguage = localStorage.getItem('language');
      var selectedOption = $(e.target).find('option:selected').text();
      var selectedRequestScenario = this.getNextHeader(dom.requestHeader, 'Request Scenario: ' + selectedOption);
      var selectedResponseScenario = this.getNextHeader(dom.responseHeader, 'Response Scenario: ' + selectedOption);
      var selectedDescription = this.getScenarioDescription(selectedRequestScenario);

      // Hide all request examples
      dom.requestExamples.hide();
      dom.responseExamples.hide();

      // Remove existing scenario descriptions
      $('blockquote.request-description').remove();

      // Show scenario example in current language
      if (selectedRequestScenario.length) {
        selectedRequestScenario.nextUntil('blockquote').filter('.highlight.' + currentLanguage).show();
        selectedResponseScenario.nextUntil('blockquote').filter('.highlight.' + currentLanguage).show();

        // Show JSON response examples for non-custom languages
        if (this.customResponseLanguages.indexOf(currentLanguage) == -1) {
          selectedResponseScenario.nextAll('.highlight.json:first').show();
        }

        // Show description of scenario if available
        if (selectedDescription) {
          selectedRequestScenario.before('<blockquote class="request-description">' + selectedDescription + '</blockquote>');
        }
      } else {
        dom.requestHeader.nextAll('.highlight.' + currentLanguage + ':first').show();
        dom.responseHeader.nextAll('.highlight.' + currentLanguage + ':first').show();

        // Show JSON response examples for non-custom languages
        if (this.customResponseLanguages.indexOf(currentLanguage) == -1) {
          dom.responseHeader.nextAll('.highlight.json:first').show();
        }
      }

      global.toc.calculateHeights();
    }
  };

  scenarioPicker.init();

})(window);
