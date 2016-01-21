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
(function () {
    'use strict';
    angular.module('jkuri.slimscroll', [])
        .directive('ngSlimscroll', slimScroll);

    slimScroll.$inject = ['$document', '$window', '$compile'];

    function slimScroll($document, $window, $compile) {
        return {
            restrict: 'A',
            scope: true,
            link: linkFn
        };

        function linkFn(scope, element, attrs) {
            setScopeValues(scope, element, attrs);

            var el = element[0];

            var minBarHeight = 30,
                releaseScroll = false,
                touchDiff,
                minBarWidth = 30;

            element.css({
                'overflow': 'hidden',
                'width': scope.width,
                'height': scope.height
            });

            var wrapper = angular.element('<div></div>');
            wrapper.css({
                'position': 'relative',
                'overflow': 'hidden',
                'width': scope.width,
                'height': scope.height
            });

            var bar = getBaseBar(scope);

            element.wrap(wrapper);
            element.append(bar);
            $compile(bar)(scope);

            scope.makeBarDraggable = function () {
                bar.bind('mousedown', function (e) {
                    var top = parseFloat(bar.css('top')),
                        pageY = e.pageY,
                        isDrag = true;

                    $document.bind('mousemove', function (e) {
                        bar.css({'top': top + e.pageY - pageY + 'px'});
                        scope.scrollContent(0, bar[0].offsetTop, false);
                    });

                    $document.bind('mouseup', function (e) {
                        isDrag = false;
                        $document.unbind('mousemove');
                    });
                }).bind('selectstart', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            };

            scope.makeBarDraggableHorizontal = function () {
                bar.bind('mousedown', function (e) {
                    var left = parseFloat(bar.css('left')),
                        pageX = e.pageX,
                        isDrag = true;

                    $document.bind('mousemove', function (e) {
                        bar.css({'left': left + e.pageX - pageX + 'px'});
                        scope.scrollContentHorizontal(0, bar[0].offsetLeft, false);
                    });

                    $document.bind('mouseup', function (e) {
                        isDrag = false;
                        $document.unbind('mousemove');
                    });
                }).bind('selectstart', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            };

            scope.getBarHeight = function () {
                var barHeight = Math.max((el.offsetHeight / el.scrollHeight) * el.offsetHeight, minBarHeight);
                var display = barHeight === el.offsetHeight ? 'none' : 'block';
                bar.css({
                    height: barHeight + 'px',
                    display: display
                });
            };

            scope.getBarWidth = function () {
                var barWidth = Math.max((el.offsetWidth / el.scrollWidth) * el.offsetWidth, minBarWidth);
                var display = barWidth === el.offsetWidth ? 'none' : 'block';
                bar.css({
                    width: barWidth + 'px',
                    display: display
                });
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
                e = e || $window.event;

                var delta = 0;

                if (e.wheelDelta) {
                    delta = -e.wheelDelta / 120;
                }

                if (e.detail) {
                    delta = e.detail / 3;
                }

                if (!scope.horizontalScroll) {
                    scope.scrollContent(delta, true);
                } else {
                    scope.scrollContentHorizontal(delta, true);
                }

                if (e.preventDefault && !releaseScroll) {
                    e.preventDefault();
                }

                if (!releaseScroll) {
                    e.returnValue = false;
                }
            };

            scope.scrollContent = function (y, isWheel) {
                releaseScroll = false;
                var delta = y,
                    maxTop = el.offsetHeight - bar[0].offsetHeight,
                    percentScroll;

                if (isWheel) {
                    delta = parseInt(bar.css('top'), 10) + y * parseInt(scope.wheelStep, 10) / 100 * bar[0].offsetHeight;
                    delta = Math.min(Math.max(delta, 0), maxTop);
                    delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);
                    bar.css({top: delta + 'px'});
                }

                percentScroll = parseInt(bar.css('top'), 10) / (el.offsetHeight - bar[0].offsetHeight);
                delta = percentScroll * (el.scrollHeight - el.offsetHeight);

                el.scrollTop = delta;
            };

            scope.scrollContentHorizontal = function (x, isWheel) {
                releaseScroll = false;
                var delta = x,
                    maxLeft = el.offsetWidth - bar[0].offsetWidth,
                    percentScroll;

                if (isWheel) {
                    delta = parseInt(bar.css('left'), 10) + x * parseInt(scope.wheelStep, 10) / 100 * bar[0].offsetWidth;
                    delta = Math.min(Math.max(delta, 0), maxLeft);
                    delta = (x > 0) ? Math.ceil(delta) : Math.floor(delta);
                    bar.css({left: delta + 'px'});
                }

                percentScroll = parseInt(bar.css('left'), 10) / (el.offsetWidth - bar[0].offsetWidth);
                delta = percentScroll * (el.scrollWidth - el.offsetWidth);

                el.scrollLeft = delta;
            };

            // mobile
            element.bind('touchstart', function (e, b) {
                if (e.touches.length) {
                    touchDiff = e.touches[0].pageY;
                }
            });

            element.bind('touchmove', function (e) {
                if (!releaseScroll) {
                    e.preventDefault();
                }

                if (e.touches.length) {
                    var diff = (touchDiff - e.touches[0].pageY) / scope.touchScrollStep;
                    if (!scope.horizontalScroll) {
                        scope.scrollContent(diff, true);
                    } else {
                        scope.scrollContentHorizontal(diff, true);
                    }
                    touchDiff = e.touches[0].pageY;
                }
            });

            attrs.$observe('enabled', function () {
                scope.enabled = scope.$eval(attrs.enabled);

                if (scope.enabled === false) {
                    bar.remove();
                    scope.detachWheel(el);
                } else {
                    element.append(bar);
                    scope.attachWheel(el);
                }
            });

            if (scope.watchContent) {
                var contentWatcher = scope.$watch(
                    function () {
                        return element.html();
                    },
                    function () {
                        init();
                    }
                );
                scope.$on("$destroy", function () {
                    contentWatcher();
                });
            }

            function init() {
                bar.css('top', '0');
                if (!scope.horizontalScroll) {
                    scope.getBarHeight();
                    scope.makeBarDraggable();
                } else {
                    scope.getBarWidth();
                    scope.makeBarDraggableHorizontal();
                }
                scope.attachWheel(el);
                return true;
            }
            
            init();
        }

        function getBaseBar(scope) {
            var bar,
                positionCss,
                commonCssProperty = {
                    'background': scope.color,
                    'position': 'absolute',
                    'opacity': scope.opacity,
                    'display': scope.alwaysVisible ? 'block' : 'none',
                    'border-radius': scope.borderRadius,
                    'z-index': '99',
                    'cursor': 'pointer'
                };
 
            if (scope.horizontalScroll) {
                bar = angular.element('<div ng-mousedown="makeBarDraggableHorizontal($event)"></div>');
                commonCssProperty = angular.extend(commonCssProperty, {
                    'height': scope.size,
                    'left': '0'
                });
                positionCss = (scope.horizontalScrollPosition === 'bottom')
                    ? {bottom: scope.distance}
                    : {top: scope.distance};
            } else {
                bar = angular.element('<div ng-mousedown="makeBarDraggable($event)""></div>');
                commonCssProperty = angular.extend(commonCssProperty, {
                    'width': scope.size,
                    'top': '0'
                });
                positionCss = (scope.position === 'right')
                    ? {right: scope.distance}
                    : {left: scope.distance};
            }

            commonCssProperty = angular.extend(commonCssProperty, positionCss);
            bar.css(commonCssProperty);
            return bar;
        }

        function setScopeValues(scope, element, attrs) {
            var height = undefined;

            if (attrs.height !== 0 && attrs.height !== undefined) {
                height = attrs.height;
            } else if (element[0].clientHeight !== 0) {
                height = element[0].clientHeight;
            } else {
                height = 250;
            }

            scope.width = attrs['width'] || element[0].clientWidth || 'auto';
            scope.height = height;
            scope.size = attrs['size'] || '7px';
            scope.color = attrs['color'] || '#000';
            scope.position = attrs['position'] || 'right';
            scope.distance = attrs['distance'] || '1px';
            scope.borderRadius = attrs['borderRadius'] || '3px';
            scope.start = attrs['start'] || 'top';
            scope.alwaysVisible = scope.$eval(attrs['alwaysVisible']) !== false;
            scope.barDraggable = scope.$eval(attrs['barDraggable']) !== false;
            scope.wheelStep = attrs['wheelStep'] || 20;
            scope.opacity = attrs['opacity'] || 0.5;
            scope.enabled = scope.$eval(attrs['enabled']) !== false;
            scope.horizontalScroll = scope.$eval(attrs['horizontalScroll']) || false;
            scope.horizontalScrollPosition = attrs['horizontalScrollPosition'] || 'bottom';
            scope.touchScrollStep = attrs['touchScrollStep'] || 200;
            scope.watchContent = scope.$eval(attrs['watchContent']) || false;
        }
    }
})();
