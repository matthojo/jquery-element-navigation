/* globals jQuery */

/**
 * Element Navigation
 * Version: 0.1.0
 * URL: http;//clock.co.uk
 * Description: Navigate between images on a page.
 * Requires: jQuery
 */

/*
 * jQuery throttle - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};})(this);


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
                case 75: //k
                  self.goToPrev()
                  break
                case 39: //right arrow
                case 40: //down arrow
                case 83: //s
                case 74: //j
                  self.goToNext()
                  break
              }
            })
          }

          if (this.opts.waitUntilLoad) { // Check if waiting for page load.
            $window.load(function() {
              self.check()
              // Check on every resize
              var throttleCheck =  $.throttle(self.opts.debounce, self.check)
              $window.scroll(throttleCheck)
            })
          } else {
            self.check()
            // Check on every resize
            var throttleCheck =  $.throttle(self.opts.debounce, self.check)
            $window.scroll(throttleCheck)

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
