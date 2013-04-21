angular.module('Geolocation', [])
	.factory('Geolocation', function($rootScope) {
		
		var Geolocation = {
			watchPosition: function(options) {
				var options = options || {};
				var watchID = null;
				var position = {
					watching: true, 
					stopWatching: function() {
						navigator.geolocation.clearWatch(watchID);
						position.watching = false;
					}
				};
				
				watchID = navigator.geolocation.watchPosition(
					function GeolocationWatchSuccess(response) {
						position.coords    = {};
						for(var i in response.coords) {
							position.coords[i] = response.coords[i];
						}
						position.timestamp = response.timestamp;
						$rootScope.$apply();
					}, 
					function GeolocationWatchFailure(error) {
						position.watching = false;
						position.error = error;
						
						$rootScope.$apply();
					}, 
					options
				);
				
				return position;
			}
		};
		
		return Geolocation;
	});