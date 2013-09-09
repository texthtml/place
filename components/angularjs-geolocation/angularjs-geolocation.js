define(function(require) {
	'use strict';
	
	
	var angular = require('components/angular/angular');
	
	angular.module('thGeolocation', [])
	.factory('thGeolocation', ['$rootScope', function($rootScope) {
		var watchID, 
			fakeID = 0, 
			geolocationConfig = {}, 
			Geolocation = {
				supported: 'geolocation' in navigator, 
				watching: false, 
				waiting: false, 
				config: function(newConfig) {
					geolocationConfig = angular.extend(geolocationConfig, newConfig || {});
					if(Geolocation.watching) {
						Geolocation.watchPosition();
					}
				}, 
				stopWatching: function(clearPosition) {
					navigator.geolocation.clearWatch(watchID);
					Geolocation.watching = false;
					fakeID++;
					
					if(clearPosition) {
						delete Geolocation.position;
					}
					delete Geolocation.error;
				}
			}, 
			getPosition = function(watching) {
				return function(success, failure) {
					var 
						options = angular.extend({}, geolocationConfig), 
						fct = navigator.geolocation[watching ? 'watchPosition' : 'getCurrentPosition'].bind(navigator.geolocation);
					
					if(watching) {
						Geolocation.stopWatching();
					}
					
					delete Geolocation.error;
					
					if(Geolocation.position === undefined) {
						Geolocation.waiting = true;
					}
					
					if(options.fake !== undefined) {
						if(typeof options.fake !== 'function') {
							var response = options.fake.coords !== undefined ? options.fake : {
								coords: options.fake, 
								timestamp: Date.now()
							};
							
							options.fake = function() {
								return response;
							};
						}
						
						var fake = options.fake;
						fake.stopped = (function(id) {
							return function() {
								return watching && id !== fakeID;
							}
						}) (fakeID);
						fct = function(success, failure, options) {
							var response = fake(function(response) {
								if(fake.stopped()) return;
								
								success(response.coords !== undefined ? response : {
									coords: response, 
									timestamp: Date.now()
								});
							}, function(error) {
								if(fake.stopped()) return;
								
								failure(error);
							}, options);
							if(response !== undefined) {
								success(response);
							}
							
						};
						
						delete options.fake;
					}
					
					watchID = fct(
						function GeolocationWatchSuccess(response) {
							Geolocation.waiting = false;
							
							Geolocation.position = {
								coords: {}, 
								timestamp: response.timestamp
							}
							for(var i in response.coords) {
								Geolocation.position.coords[i] = response.coords[i];
							}
							success && success(Geolocation.position);
							
							if($rootScope.$$phase === null) {
								$rootScope.$apply();
							}
						}, 
						function GeolocationWatchFailure(error) {
							Geolocation.position.watching = false;
							Geolocation.position = undefined;
							Geolocation.error = error;
							
							failure && failure(Geolocation.error);
							
							if($rootScope.$$phase === null) {
								$rootScope.$apply();
							}
						}
					);
					
					Geolocation.watching = Geolocation.watching || watching;
				};
			};
		
		Geolocation.watchPosition      = getPosition(true);
		Geolocation.getCurrentPosition = getPosition(false);
		
		return Geolocation;
	}]);
});