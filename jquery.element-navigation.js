/* globals jQuery, _ */

/**
 * Element Navigation
 * Version: 0.1.0
 * URL: http;//clock.co.uk
 * Description: Navigate between images on a page.
 * Requires: jQuery, Underscore.js
 */

(function($, document, window, undefined) {
    'use strict';

    var pluginName = 'elNav'
      , defaults = {
        target: null
      , nav: null
      , keyboard: true
      , setParentActive: false
      , threshold: 10
      , padding: 0
      , debounce: 100
      , waitUntilLoad: true
      , updateURL: true
      }
      , self
      , $elems = []

      , $window = $(window)
      , $html = $('html,body')
      , $navUp = $('.js-nav-up')
      , $navDown = $('.js-nav-down')

    function Plugin(element, options) {
        this.element   = element;

        // Merge the options given by the user with the defaults
        this.options   = $.extend({}, defaults, options)

        // Attach data to the elment
        this.$el       = $(element)
        this.$el.data(name, this)

        this._defaults = defaults

        var meta       = this.$el.data(name + '-opts')
        this.opts      = $.extend(this._defaults, options, meta)

        this.init()
      }

    Plugin.prototype = {
        init: function() {
          // Plugin initializer - prepare your plugin
          if (this.target === null) {
            $.error('Element Navigation requires a target element.')
          }

          this.$el.find(this.opts.target).each(function() {
            $elems.push($(this))
          })
          this.lastScrollTop = 0
          self = this

          if (this.opts.nav) {
            $('body').on('click', '.js-nav-up', function(e) {
              e.preventDefault()
              self.goToPrev()
            })
            $('body').on('click', '.js-nav-down', function(e) {
              e.preventDefault()
              self.goToNext()
            })
          }

          if(this.opts.keyboard) {
            $window.on('keyup', function(e) {
              /* jshint maxcomplexity: 9 */
              e.preventDefault()
              switch (e.keyCode) {
                case 37: //left arrow
                case 38: //up arrow
                case 87: //w
                case 74: //j
                  self.goToPrev()
                  break
                case 39: //right arrow
                case 40: //down arrow
                case 83: //s
                case 75: //k
                  self.goToNext()
                  break
              }
            })
          }

          if (this.opts.waitUntilLoad) { // Check if waiting for page load.
            $window.load(function() {
              self.check()
              // Check on every resize
              var debouncedCheck =  debounce(self.check, self.opts.debounce)
              $window.scroll(debouncedCheck)
            })
          } else {
            self.check()
            // Check on every resize
            var debouncedCheck =  debounce(self.check, self.opts.debounce)
            $window.scroll(debouncedCheck)

          }
        }
      /**
      * Check to see if an element is in view
      * Also checks to see if navigation controls are to be shown
      **/
      , check: function() {
          var threshPercent = self.opts.threshold / 100
          if(self.opts.nav) {
            // Hide up button if at the top
            if ($window.scrollTop() - ($window.scrollTop() * threshPercent) < $elems[0].offset().top) {
              $navUp.addClass('hidden')
            } else {
              $navUp.removeClass('hidden')
            }

            // Hide bottom button if at the bottom
            if ($window.scrollTop() + ($window.scrollTop() * threshPercent)
              > $elems[$elems.length - 1].offset().top) {
              $navDown.addClass('hidden')
            } else {
              $navDown.removeClass('hidden')
            }
          }

          // Checks to see if element has passed threshold from top of screen
          // THIS NEEDS REVISION
          jQuery.each($elems, function(index, val) {
            var position = val.offset().top - $window.scrollTop()

            if (position >= $window.scrollTop() - (val.offset().top + (val.height() * threshPercent))
                && position <= ($window.height() * threshPercent)
                ) {

              if(self.opts.setParentActive) {
                val.parent().addClass(pluginName + '-active')
              } else {
                val.addClass(pluginName + '-active')
              }

              if (self.opts.updateURL) {
                self.updateURL(val)
              }
            } else {
              if(self.opts.setParentActive) {
                val.parent().removeClass(pluginName + '-active')
              } else {
                val.removeClass(pluginName + '-active')
              }
            }
          })
        }

      /**
      * Navigate to next element (scrolling down) based on scroll position
      **/
      , goToNext: function() {
          var closest = $elems[0]
          jQuery.each($elems, function(i, val) {
            var baseline = $window.scrollTop() + $window.height()
              , margin = self.opts.padding
            if (Math.abs(val.offset().top - (baseline - margin))
              < Math.abs(closest.offset().top - (baseline - margin))) {
              closest = val
            }
          })
          $html.stop().animate({
            scrollTop: closest.offset().top - self.opts.padding
          }, 400)
        }
      /**
      * Navigate to prev element (scrolling up) based on scroll position
      **/
      , goToPrev: function() {
          var closest = $elems[0]
          jQuery.each($elems, function(i, val) {
            var baseline = $window.scrollTop()
              , margin = 0
            if (Math.abs((val.offset().top + val.height()) - (baseline + margin))
              < Math.abs((closest.offset().top + closest.height()) - (baseline + margin))) {
              closest = val
            }
          })
          $html.stop().animate({
            scrollTop: closest.offset().top - self.opts.padding
          }, 400)
        }
      , updateURL: function(val) {

          var idTarget

          if(this.opts.setParentActive) {
            idTarget = val.parent()
          } else {
            idTarget = val
          }
          // Set URL hash if element has an ID
          if (idTarget.attr('id')) {
            if (history.pushState) {
              // Add hash to URL
              history.replaceState(null, null, '#' + idTarget.attr('id'));
            } else {
              // Add hash to URL for legacy browsers
              var id = idTarget.attr('id')
              idTarget.attr('id', '')
              location.hash = '#' + id
              idTarget.attr('id', id)
            }
          } else if (location.hash){ // Otherwise remove the hash
            if (history.pushState) {
              // Remove hash from URL
              history.replaceState(null, null, location.pathname);
            } else {
              location.href = location.href.replace(/#.*$/, '#')
            }
          }
        }
      }

    $.fn[pluginName] = function(options) {
        // Iterate through each DOM element and return it
        return this.each(function() {
            // prevent multiple instantiations
            if (!$.data(this, 'plugin_' + pluginName)) {
              $.data(this, 'plugin_' + pluginName, new Plugin(this, options))
            }
          })
      }

  })(jQuery, document, window)

// debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
var debounce = function (func, threshold, execAsap) {
    var timeout;

    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };
}
