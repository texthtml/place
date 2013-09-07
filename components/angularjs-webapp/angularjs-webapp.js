angular.module('thWebApp', [])
	.factory('thHistory', ['$window', '$rootScope', function($window, $rootScope) {
		var position = $window.history.state === undefined ? 0 : $window.history.state === null ? 0 : $window.history.state.position;
		
		var History = {
			position: function() {
				return position;
			}, 
			replace: function(data) {
				$window.history.replaceState({
					data: data, 
					position: position
				}, '');
				
				$rootScope.$broadcast('history:current-state-changed', data, position);
			}, 
			push: function(data, url) {
				$window.history.pushState({
					data: data, 
					position: ++position
				}, '', url);
				
				$rootScope.$broadcast('history:current-state-changed', data, position);
			}, 
			back: function() {
				$window.history.back();
			}, 
			state: function() {
				return $window.history.state === undefined ? null : $window.history.state === null ? null : $window.history.state.data;
			}
		};
		
		$window.addEventListener('popstate', function() {
			$rootScope.$broadcast('history:current-state-changed', History.state(), --position);
		});
		
		$rootScope.$evalAsync(function() {
			$rootScope.$broadcast('history:current-state-changed', History.state(), position);
		})
		
		return History;
	}])
	.factory('thRouter', ['$parse', function($parse) {
		
		var routes = [];
		
		var Router = {
			register: function(elem) {
				routes.push({
					elem: elem, 
					match: function(route) {
						return function(path) {
							if(route.length !== path.length) {
								return false;
							}
							for(var i = 0; i < route.length; i++) {
								if(route[i][0] !== ':' && route[i] !== path[i]) {
									return false;
								}
							};
							return true;
						}
					} ((elem.attr('th:route') || elem.attr('th-route') || elem.attr('thRoute')).split('/'))
				});
			}, 
			find: function(path) {
				var parts = path.split('/');
				var result = null;
				
				routes.some(function(route) {
					if(route.match(parts)) {
						result = route;
						return true;
					}
				})
				
				return result;
			}, 
			compile: function(route, scope) {
				if(route === undefined) return null;
				
				return route.split('/').map(function(part) {
					return part[0] !== ':' ? part : encodeURIComponent(scope.$eval(part.substr(1)));
				}).join('/');
			}, 
			parse: function(route, path, scope) {
				var parts = path.split('/');
				(route || '').split('/').forEach(function(part, i) {
					if(part[0] === ':') {
						var expr = part.substr(1);
						var value = parts[i];
						
						$parse(expr).assign(scope, decodeURIComponent(value));
					}
				});
			}
		};
		
		return Router;
	}])
	.factory('thScreenManager', ['$rootScope', '$window', 'thHistory', 'thRouter', 
	function($rootScope, $window, thHistory, thRouter) {
		var current;
		var currentClass;
		var homeSelector;
		
		$rootScope.$on('history:current-state-changed', function(event, state) {
			applyState(state);
		});
		
		function applyState(state) {
			if(state === null) return;
			
			var el         = setupScreen(state);
			var scope      = el.scope();
			var onActivate = el.attr('th:screen:activate') || 
			                 el.attr('th:screen-activate') || 
			                 el.attr('th-screen:activate') || 
			                 el.attr('th-screen-activate') || 
			                 el.attr('th:screenActivate') || 
			                 el.attr('th-screenActivate') || 
			                 el.attr('thScreen:activate') || 
			                 el.attr('thScreenActivate') || 
			                 el.attr('thScreen-activate');
			
			thRouter.parse(el.attr('th:route') || el.attr('th-route') || el.attr('thRoute'), $window.location.pathname, scope);
			
			if(scope.$$phase === null) {
				scope.$apply();
			}
			
			if(onActivate !== undefined) {
				scope.$eval(onActivate);
			}
		}
		
		function setupScreen(state) {
			var selector  = state.selector;
			var model     = state.model;
			var el        = typeof state.selector === 'string' ? angular.element($window.document.querySelector(selector)) : selector;
			var modelName = el.attr('th:model') || el.attr('th-model') || el.attr('thModel');
			
			if(current !== undefined) {
				current.removeClass(currentClass);
			}
			
			if(modelName !== undefined) {
				var scope = el.scope();
				scope[modelName] = model;
				if(scope.$$phase === null) {
					scope.$apply();
				}
			}
			el.addClass(currentClass);
			current = el;
			
			return el;
		}
		
		var ScreenManager = {
			replace: function(screen, model) {
				if(screen[0] !== current[0]) {
					return false;
				}
				
				thHistory.replace({
					model: model, 
					selector: thHistory.state().selector
				});
				
				return true;
			}, 
			go: function(screen, model) {
				if(screen === '$backOrHome') {
					screen = thHistory.position() === 0 ? '$home' : '$back';
				}
				
				if(screen === '$back') {
					return thHistory.back();
				}
				
				var selector = screen === '$home' ? homeSelector : screen;
				var state = {
					model: model, 
					selector: selector
				};
				var el = setupScreen(state);
				var url = thRouter.compile(el.attr('th:route') || el.attr('th-route') || el.attr('thRoute'), el.scope());
				
				thHistory.push(state, url, true);
			}, 
			config: function(_currentClass, _homeSelector) {
				currentClass = _currentClass;
				homeSelector = _homeSelector;
			}, 
			start: function() {
				if(thHistory.state() === null) {
					// wait for routes to register
					$rootScope.$evalAsync(function() {
						var route = thRouter.find($window.location.pathname);
						var state = {
							selector: route === null ? homeSelector : '[route="'+(route.elem.attr('th:route') || route.elem.attr('th-route') || route.elem.attr('thRoute'))+'"]', 
							historyPosition: currentHistoryPosition = 0
						};
						
						thHistory.replace(state);
					});
				}
			}
		};
		
		return ScreenManager;
	}])
	.directive('thApp', ['thScreenManager', function webappFactory(thScreenManager) {
		return {
			controller: ['$attrs', function($attrs) {
				thScreenManager.config(
					$attrs.thScreenClass || 'active', 
					$attrs.thFirstScreen || '#home'
				);
				thScreenManager.start();
			}]
		};
	}])
	.directive('thRoute', ['thRouter', function routeFactory(thRouter) {
		return {
			restrict: 'A', 
			link: function routeAttributeLink(scope, element, attrs) {
				thRouter.register(element);
			}
		};
	}])
	.directive('thModel', ['thHistory', 'thScreenManager', function screenFactory(thHistory, thScreenManager) {
		return {
			restrict: 'A', 
			link: function modelReplaceStateFactory(scope, element, attrs) {
				scope.replaceState = function() {
					var model = scope.$eval(attrs.thModel);
					thScreenManager.replace(element, model);
				}
			}
		};
	}])
	.directive('thScreen', ['thScreenManager', function screenFactory(thScreenManager) {
		return {
			restrict: 'A', 
			link: function screenAttributeLink(scope, element, attrs) {
				element.bind('click', function(event) {
					thScreenManager.go(attrs.thScreen, scope.$eval(attrs.thScreenModel));
				});
				
				if(attrs.thScreen === '$back') {
					element[0].disabled = !thHistory.position();
					scope.$on('history:current-state-changed', function(event, data, position) {
						element[0].disabled = !position;
					});
				}
			}
		};
	}]);