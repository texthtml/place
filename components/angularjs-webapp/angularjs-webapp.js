angular.module('WebApp', [])
	.factory('History', function($window, $rootScope) {
		var position = $window.history.state === null ? 0 : $window.history.state.position || 0;
		
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
				return $window.history.state === null ? null : $window.history.state.data;
			}
		};
		
		$window.addEventListener('popstate', function() {
			$rootScope.$broadcast('history:current-state-changed', History.state(), --position);
		});
		
		$rootScope.$evalAsync(function() {
			$rootScope.$broadcast('history:current-state-changed', History.state(), position);
		})
		
		return History;
	})
	.factory('Router', function($parse) {
		
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
					} (elem.attr('route').split('/'))
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
	})
	.factory('ScreenManager', function($rootScope, $window, History, Router) {
		var current;
		var currentClass;
		var homeSelector;
		
		$rootScope.$on('history:current-state-changed', function(event, state) {
			applyState(state);
		});
		
		function applyState(state) {
			if(state === null) return;
			
			var el    = setupScreen(state);
			var scope = el.scope();
			
			Router.parse(el.attr('route'), $window.location.pathname, scope);
			
			if(scope.$$phase === null) {
				scope.$apply();
			}
		}
		
		function setupScreen(state) {
			var selector  = state.selector;
			var model     = state.model;
			var el        = typeof state.selector === 'string' ? angular.element($window.document.querySelector(selector)) : selector;
			var modelName = el.attr('ng:model') || el.attr('ngModel') || el.attr('ngModel');
			
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
			go: function(screen, model) {
				if(screen === '$backOrHome') {
					screen = History.position() === 0 ? '$home' : '$back';
				}
				
				if(screen === '$back') {
					return History.back();
				}
				
				var selector = screen === '$home' ? homeSelector : screen;
				var state = {
					model: model, 
					selector: selector
				};
				var el = setupScreen(state);
				var url = Router.compile(el.attr('route'), el.scope());
				
				History.push(state, url, true);
			}, 
			config: function(_currentClass, _homeSelector) {
				currentClass = _currentClass;
				homeSelector = _homeSelector;
			}, 
			start: function() {
				if(History.state() === null) {
					// wait for routes to register
					$rootScope.$evalAsync(function() {
						var route = Router.find($window.location.pathname);
						var state = {
							selector: route === null ? homeSelector : '[route="'+route.elem.attr('route')+'"]', 
							historyPosition: currentHistoryPosition = 0
						};
						
						History.replace(state);
					});
				}
			}
		};
		
		return ScreenManager;
	})
	.directive('ngApp', function webappFactory(ScreenManager) {
		return {
			controller: function($attrs) {
				ScreenManager.config(
					$attrs.screenClass || 'active', 
					$attrs.firstScreen || '#home'
				);
				ScreenManager.start();
			}
		};
	})
	.directive('route', function routeFactory(Router) {
		return {
			restrict: 'A', 
			link: function routeAttributeLink(scope, element, attrs) {
				Router.register(element);
			}
		};
	})
	.directive('screen', function screenFactory(History, ScreenManager) {
		return {
			restrict: 'A', 
			link: function screenAttributeLink(scope, element, attrs) {
				element.bind('click', function(event) {
					ScreenManager.go(attrs.screen, scope.$eval(attrs.screenModel));
				});
				
				if(attrs.screen === '$back') {
					element[0].disabled = !History.position();
					scope.$on('history:current-state-changed', function(event, data, position) {
						element[0].disabled = !position;
					});
				}
			}
		};
	});