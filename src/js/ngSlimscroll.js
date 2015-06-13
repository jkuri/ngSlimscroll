/*
 * AngularJS Slimscroll directive 
 * Originally developed by Piotr Rochala (http://rocha.la) (jQuery version)
 * 
 * This is a rewritten version of original jQuery slimsSroll (http://rocha.la/jQuery-slimScroll)
 * 
 * This version required AngularJS but does NOT require jQuery
 *
 * Author: Jan Kuri (jkuri88@gmail.com)
 * Licence: GPL (http://www.opensource.org/licenses/gpl-license.php)
 * Version 0.6.0
 */
angular.module('jkuri.slimscroll', [])

.directive('ngSlimscroll', ['$document', '$window', '$compile', function($document, $window, $compile) {
	'use strict';

	var setScopeValues = function (scope, element, attrs) {
		var height = undefined;
		
		if (attrs.height !== 0 && attrs.height !== undefined) {
			height = attrs.height;
		} else if (element[0].clientHeight !== 0) {
			height = element[0].clientHeight;
		} else {
			height = 250;
		}

		scope.width = attrs.width || element[0].clientWidth || 'auto';
		scope.height = height;
		scope.size = attrs.size || '7px';
		scope.color = attrs.color || '#000';
		scope.position = attrs.position || 'right';
		scope.distance = attrs.distance || '1px';
		scope.borderRadius = attrs.borderRadius || '3px';
		scope.start = attrs.start || 'top';
		scope.alwaysVisible = scope.$eval(attrs.alwaysVisible) || true;
		scope.barDraggable = scope.$eval(attrs.barDraggable) || true;
		scope.wheelStep = attrs.wheelStep || 20;
		scope.opacity = attrs.opacity || 0.5;
		scope.enabled = scope.$eval(attrs.enabled) || true;
	};

	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			setScopeValues(scope, element, attrs);

			var el = element[0];

			var minBarHeight = 30,
				isOverPanel,
				releaseScroll = false,
				isDrag = false;

			element.css({
				'overflow': 'hidden',
				'width': scope.width + 'px',
				'height': scope.height + 'px',
			});

			var wrapper = angular.element('<div></div>');
			wrapper.css({
				'position': 'relative',
				'overflow': 'hidden',
				'width': scope.width + 'px',
				'height': scope.height + 'px'
			});

			var bar = angular.element('<div ng-mousedown="makeBarDraggable($event)""></div>');
			bar.css({
				'background': scope.color,
				'width': scope.size,
				'position': 'absolute',
				'top': '0',
				'opacity': scope.opacity,
				'display': scope.alwaysVisible ? 'block' : 'none',
				'border-radius': scope.borderRadius,
				'z-index': '99',
				'cursor': 'pointer'
			});

			var positionCss = (scope.position === 'right') ? { right: scope.distance } : { left: scope.distance };
			bar.css(positionCss);

			element.wrap(wrapper);
			element.append(bar);
			$compile(bar)(scope);

			scope.makeBarDraggable = function () {
				bar.bind('mousedown', function(e) {
					var top = parseFloat(bar.css('top')),
					    pageY = e.pageY,
					    isDrag = true;

					$document.bind('mousemove', function(e) {
						bar.css({'top': top + e.pageY - pageY + 'px'});
						scope.scrollContent(0, bar[0].offsetTop, false);
					});

					$document.bind('mouseup', function(e) {
						isDrag = false;
						$document.unbind('mousemove');
					});

					return;
				}).bind('selectstart', function(e) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
			};

			scope.getBarHeight = function () {
				var barHeight = Math.max((el.offsetHeight / el.scrollHeight) * el.offsetHeight, minBarHeight);
          			bar.css({ 'height': barHeight + 'px' });
          			var display = barHeight === el.offsetHeight ? 'none' : 'block';
          			bar.css({ display: display });
			};

			scope.attachWheel = function (target) {
				if ($window.addEventListener) {
					target.addEventListener('DOMMouseScroll', scope.onWheel, false);
					target.addEventListener('mousewheel', scope.onWheel, false);
				} else {
					$document.addEventListener('onmousewheel', scope.onWheel);
				}
			};

			scope.detachWheel = function (target) {
				if ($window.removeEventListener) {
					target.removeEventListener('DOMMouseScroll', scope.onWheel, false);
					target.removeEventListener('mousewheel', scope.onWheel, false);
				} else {
					$document.removeEventListener('onmousewheel', scope.wheel);
				}
			};

			scope.onWheel = function (e) {
				var e = e || $window.event;

				var delta = 0;

				if (e.wheelDelta) { delta = -e.wheelDelta / 120; }
				if (e.detail) { delta = e.detail / 3; }

				var target = e.target || e.srcTarget || e.srcElement;
				scope.scrollContent(delta, true);

				if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
				if (!releaseScroll) { e.returnValue = false; }
			};

			scope.scrollContent = function (y, isWheel, isJump) {
				releaseScroll = false;
				var delta = y,
					maxTop = el.offsetHeight - bar[0].offsetHeight,
					percentScroll,
					barTop;

				if (isWheel) {
					delta = parseInt(bar.css('top'), 10) + y * parseInt(scope.wheelStep, 10) / 100 * bar[0].offsetHeight;
					delta = Math.min(Math.max(delta, 0), maxTop);
					delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);
					bar.css({ top: delta + 'px' });
				}

				percentScroll = parseInt(bar.css('top'), 10) / (el.offsetHeight - bar[0].offsetHeight);
          			delta = percentScroll * (el.scrollHeight - el.offsetHeight);

				el.scrollTop = delta;
			};

			attrs.$observe('enabled', function() {
				scope.enabled = scope.$eval(attrs.enabled);
				
				if (scope.enabled === false) {
					bar.remove();
					scope.detachWheel(el);
				} else {
					element.append(bar);
					scope.attachWheel(el);
				}

			});

			scope.getBarHeight();
			scope.attachWheel(el);
			scope.makeBarDraggable();

		}
	};

}]);
