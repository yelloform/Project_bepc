/*
 * jQuery SwipeView v1.0.0
 * http://ignaz.net/
 *
 * Copyright 2013 ignaz.
 * Free to use under the by-nc-sa license.
 * http://creativecommons.org/licenses/by-nc-sa/2.0/kr/
 */

;(function($) {
	'use strict';

	window.SwipeView = function(container, options) {

		var s = this;

		var defaults = {
			index: 0,
			count: 0,
			viewIndex: 0,
			element : '.container',
			elementPanel: '.panel',
			bulletClass: 'on',
			change : true,
			panel: [],
			view : [],

			duration: 400,
			delay: 5000,
			autoplay: true,
			mousewheelControl: false,

			complete: false,
			controls: true
		},


		prefixStyle = function(prop) {
			var vendorProp,
			div = document.createElement('div'),
			vendors = 'Khtml Ms O Moz Webkit'.split(' '),
			len = vendors.length;

			if ( prop in div.style ) {
				return prop;
			} else {


				prop = prop.replace(/^[a-z]/, function(val) {
					return val.toUpperCase();
				});

				while(len--) {
					vendorProp = vendors[len] + prop;
					if ( vendorProp in div.style ) {
						return vendorProp;
					} 
				}
				
			}

			div = null;

			return false;
		}

		// 파이어폭스 3.x 버전은 마우스 휠을 인식하지 못함.
		s.mouseWheelEvent 		= (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel",
		s.startEvent			= s.support.touch ? 'touchstart' 	: 'mousedown',
		s.moveEvent				= s.support.touch ? 'touchmove' 	: 'mousemove',
		s.endEvent				= s.support.touch ? 'touchend' 		: 'mouseup',
		s.cancelEvent			= s.support.touch ? 'touchcancel' 	: 'mouseup',
		s.transitionEndEvent	= (function() {

			var el = document.createElement('div');

			var transitions = {
				'transition': 'transitionend',
				'OTransition': 'oTransitionEnd',
				'MozTransition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			}

			for (var t in transitions) {
				if (el.style[t] !== undefined) {
					return transitions[t];
				}
			}

			return false;
		})()

		s.container = container;

		s.element = document; //s.container[0];
		s.elementWidth = s.container.width();
		s.options = s.extend(defaults, options);

		
		s.body = $('body');

		s.panel = [];

		s.playing = false;
		s.playTimer = null;
		s.resizeTimer = null;

		s.startAutoplay = function() {
			s.playing = true;
			s.playTimer = setInterval(s.update, s.options.delay);
		}

		s.stopAutoplay = function() {
			s.playing = false;
			clearInterval(s.playTimer);
			s.playTimer = null;
		}

		s.next = function() {

		}

		s.prev = function() {

		}

		s.update = function(data) {

			if (s.isAnimate)
				return false;


			s.isAnimate = true;

			var prev = s.getPanel();

			prev.content.fadeOut(s.options.duration);
			prev.stop().fadeOut(s.options.duration);

			var index = s.getIndex();

			s.pagination.eq(index).removeClass(s.options.bulletClass);

			if (data) {
				if (data.index != undefined)
					index = s.setIndex(data.index, true);

				if (data.x || data.y) {
					var dur = data.x || data.y;
					index = s.setIndex(dur > 0 ? -1 : 1);	
				}
			} else {
				index = s.setIndex(1);
			}


			var next = s.getPanel();
			s.pagination.eq(index).addClass(s.options.bulletClass);

			next.content.fadeIn(s.options.duration);
			next.stop().fadeIn(s.options.duration, function() {
				

				// next.content.fadeIn(s.options.duration, function() {
					s.isAnimate = false;
				// });

				if (s.options.autoplay && !s.playTimer)
					s.startAutoplay();
			});



		}

		s.setColor = function(prev, next) {

			if (!next)
				next = s.getPanel().color;

			// color update
			if (!s.body.hasClass(next))
				s.body.removeClass('white black').addClass(next);
		}


		s.pagination = $('.swipe-pagination span');

		s.paginationControl = function() {
			// s.container.find('.pagination span')
			s.pagination.click(function() {
				var index = $(this).index();

				if (index != s.getIndex())
					s.update({index: index});

			});
		}

		s.direction = $('.swipe-direction span');

		s.directionControl = function() {
			s.direction.click(function() {
				var index = $(this).index();

				s.update({index: s.getIndex(index || -1)});
			})
		}



		s.setup = function() {
			// $("#wrap").hide();
			s.count = 1;

			s.options.count = s.container.find('.panel').length;

			if (s.options.count) {

				s.container.find('.panel').each(function(i) {
					var _this = $(this);

					s.panel[i] = _this;
					// s.panel[i].color = _this.attr('data-color');
					s.panel[i].content = $('#swipe-info .panel').eq(i);


					s.panel[i].find('.img-bg').lazyload(function(src) {
						
						_this.find('.img-bg').css('background-image', 'url('+src+')').attr('data-src', '')

						if (++s.count > s.options.count) {

							
							// $('#loading').fadeOut(function() {

								// $("#wrap").show();

								s.panel[0].delay(1000).fadeIn(s.options.duration, function() {

									s.panel[0].content.fadeIn(s.options.duration);
								
									s.pagination.first().addClass('on');
									// s.setColor(s.panel[0].color); // color update

									if (s.options.autoplay)
										s.startAutoplay();

									if (s.options.controls) {
										s.paginationControl();
										s.directionControl();
									}

									s.complete = true;
								});
							// });
							
						}

					});
				});
			}

		}

		s.isStart = false;
		s.isMove = false;
		s.isEnd = false;
		s.isAnimate = false;
		s.isValidSwipe = false;
		s.isScrolling = false;

		s.add = $.event.add;
		s.remove = $.event.remove;
		s.trigger = $.event.trigger;

		

		s.onStart = function(e) {

			if (!s.complete)
				return false;

			var point = s.support.touch ? e.originalEvent.touches[0] : e;

			var data = {
				x: point.pageX,
				y: point.pageY,
				time: e.timeStamp
			}

			s.add(s.element, s.moveEvent, s.handler, data);
			s.add(s.element, s.endEvent, s.handler, data);

			s.stopAutoplay();

		}

		s.onMove = function(e) {

			if (s.isAnimate)
				return false;
			
			var point = s.support.touch ? e.originalEvent.changedTouches[0] : e;

			var data = {
				x : point.pageX - e.data.x,
				y : point.pageY - e.data.y,
				time: e.timeStamp - e.data.time
			}

			// 스크롤 정보가 없다면
			if ( s.isScrolling === undefined ) {
				s.isScrolling = !!( s.isScrolling || Math.abs(data.x) < Math.abs(data.y) );
				
			}

			if (s.isScrolling) {
				// 안드로이드 기본 브라우저 touchend issue
				if (s.device.android && s.browser.samsung)
					s.trigger(s.endEvent, null, s.element);

			} else {
				// e.preventDefault();
			}

		}

		s.onEnd = function(e) {

			var point = s.support.touch ? e.originalEvent.changedTouches[0] : e;

			var data = {
				x : point.pageX - e.data.x,
				y : point.pageY - e.data.y,
				time: e.timeStamp - e.data.time

			}

			if (!s.isScrolling) {

				s.isValidSwipe = Math.abs(data.x) > 70 || Math.abs(data.y) > s.elementWidth/2;

				if (s.isValidSwipe)
					s.update({x: data.x}); // s.update(data);

			}

			s.remove(s.element, s.moveEvent, s.handler);
			s.remove(s.element, s.endEvent, s.handler);

		}

		s.onMouseWheel = function(e) {

			if (!s.complete)
				return false;

			var e = window.event || e; //equalize event object
    		var delta = e.detail? e.detail*(-120) : e.wheelDelta; //check for detail first so Opera uses that instead of wheelDelta

    		s.update({ y: delta });
		}

		
		

		s.onResize = function(e) {
			
			if (s.resizeTimer !== null) {
				clearTimeout(s.resizeTimer);
				s.resizeTimer = null;
			}

			s.resizeTimer = setTimeout(function() {
				s.elementWidth = s.container.width();
			}, 500);

		}

		s.onTransitionEnd = function(e) {
			s.element.removeEventListener(s.transitionEndEvent, s, false);
		}

		s.destroy = function() {
			s.element.removeEventListener(s.startEvent, s, false);
			s.element.removeEventListener(s.moveEvent, s, false);
			s.element.removeEventListener(s.endEvent, s, false);
			s.element.removeEventListener(s.transitionEndEvent, s, false);
		}
		//handleEvent
		s.handler = function(e) {
			
			switch (e.type) {
				case s.startEvent:
					s.onStart(e);
					break;

				case s.moveEvent:
					s.onMove(e);
					break;

				case s.cancelEvent:
				case s.endEvent:
					s.onEnd(e);
					break;

				case s.transitionEndEvent:
					s.onTransitionEnd(e);
					break;

				case s.mouseWheelEvent:
					s.onMouseWheel(e);
					break;

				case 'resize':
					s.onResize(e);
					break;
			}
		}

		s.getPanel = function(increment) {
			return s.panel[s.getIndex(increment)];
		}

		s.getIndex = function(increment) {
			var index = s.options.index,
				count = s.options.count;

			if (!increment || increment === undefined)
				return index;

			var newIndex = (index + increment) % count;

			return (newIndex < 0) ? count + newIndex : newIndex;
		}

		s.setIndex = function(increment, direct) {
			return s.options.index = direct ? increment : s.getIndex(increment);
		}


		s.init = function() {

			s.add(s.element, s.startEvent, s.handler);

			if (s.options.mousewheelControl && !s.device.isMobile)
				s.add(document, s.mouseWheelEvent, s.handler);

			// resize
			s.add(window, 'resize', s.handler);

		}

		s.setup();
		s.init();



		// return {
		// 	init : initModule
		// }

	};

	SwipeView.prototype = {

		browser: (function() {
			var ua = navigator.userAgent;

			var browser = {};

			var ie = ua.match(/(MSIE |Trident.*rv[ :])([\d]+)/);

			if (ie) {
				browser.ie = true;
				browser.ieVersion = ie.pop();
			}

			var samsung = ua.match(/SamsungBrowser\/([\d.]+)/);

			if (samsung) {
				browser.samsung = true;
				browser.samsungVersion = samsung.pop();
			}


			return browser;


			

		})(),

		device: (function() {

			var ua = navigator.userAgent;

			var device = {};

			var ios = ua.match(/(iPad|iPod|iPhone).*OS ([\d_]+)/);

			if (ios) {
				device.ios = true;
				device.iosVersion = ios.pop().replace('_', '.');
			}

			var android = ua.match(/(Android);? ([\d.]+)/);

			if (android) {
				device.android = true;
				device.androidVersion = android.pop();
			}

			return {
				isMobile: device.ios || device.android,
				ios: device.ios,
				android: device.android
			};

		})(),

		support: {
			touch : (window.Modernizr && Modernizr.touch === true) || (function () {
				return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
			})(),

			transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
				var div = document.createElement('div').style;
				return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
			})()
		},

		extend: function(defaults, options) {
			var extended = {};
			var prop;
			for (prop in defaults) {
				if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
					extended[prop] = defaults[prop];
				}
			}
			for (prop in options) {
				if (Object.prototype.hasOwnProperty.call(options, prop)) {
					extended[prop] = options[prop];
				}
			}
			return extended;
		}

	}

	$.fn.lazyload = function(callback) {

		var _this = this;
		var image = new Image();

		image.src = $(this).attr('data-src');
		image.onload = function() {

			callback && callback.call(_this, this.src);
		}

	}

	if (!('transitionEnd' in $.fn)) {
		$.fn.transitionEnd = function (callback) {
			var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
				i, j, dom = this;

			function fireCallBack(e) {
				if (e.target !== this) return;
				
				callback.call(this, e);

				for (i = 0; i < events.length; i++) {
					dom.off(events[i], fireCallBack);
				}
			}

			if (callback) {
				for (i = 0; i < events.length; i++) {
					dom.on(events[i], fireCallBack);
				}
			}
			return this;
		};
	}

	if (!('transform' in $.fn)) {
		$.fn.transform = function (transform) {
			for (var i = 0; i < this.length; i++) {
				var elStyle = this[i].style;
				elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
			}
			return this;
		};
	}
	
	if (!('transition' in $.fn)) {
		$.fn.transition = function (duration) {
			if (typeof duration !== 'string') {
				duration = duration + 'ms';
			}
			for (var i = 0; i < this.length; i++) {
				var elStyle = this[i].style;
				elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
			}
			return this;
		};
	}

	$.fn.SwipeView = function(options) {
		return new SwipeView(this, options);
	}

})(jQuery);