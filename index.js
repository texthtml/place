window.module = angular.module('FoursquareApp', ['WebApp', 'FoursquareService'])
	.directive('ngModelDelay', function($timeout) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elm, attr, ngModelCtrl) {
				if (attr.type === 'radio' || attr.type === 'checkbox') return;

				elm.unbind('input').unbind('keydown').unbind('change');
				
				var promise = null;
				
				elm.bind('input', function() {
					if(promise !== null) {
						$timeout.cancel(promise);
					}
					promise = $timeout(function() {
						promise = null;
						ngModelCtrl.$setViewValue(elm.val());
					}, 200, true);
				});
			}
		};
	})
	.config(function FoursquareAppRun(FoursquareProvider) {
		FoursquareProvider.config({
			clientId: location.hostname === 'place.texthtml.net' ? 'BPZJXWFV0BBYQTIC04N34Q2QIRKKULRQIGX0OVNWALFSNFEI' : 'KUSZIXIYTQ252MLOAXHMFTTQOSMJS14G544EJA3EKTRUVRB4', 
			clientSecret: location.hostname === 'place.texthtml.net' ? 'ZF3DCPSVCW4VZFTVUVOKRGXGMSLQWTXER24JS2BJATDKEMHI' : '2YKQWTLKJBYTE4ASWIGEZ5ERU4N3GN4AQCQ5P2O0SWVKBYFY', 
			redirectURI: document.location.href + '?authenticated'
		});
	})
	.controller('FoursquareApp', function FoursquareApp($scope, $rootScope, Foursquare) {
		$scope.fsq = Foursquare;
		
		$scope.setVenue = function(venue) {
			$rootScope.$broadcast('venue', venue);
		};
	})
	.controller('FoursquareHome', function FoursquareHome($scope, Foursquare) {
		$scope.loading = false;
		
		$scope.$watch('fsq.logged', function(logged) {
			$scope.checkins = [];
			if(logged) {
				$scope.loading = true;
				Foursquare.api.checkins.recent().then(function(response) {
					$scope.checkins = [];
					[].push.apply($scope.checkins, response.data);
					$scope.loading = false;
				});
			}
		});
	})
	.controller('FoursquareCheckin', function FoursquareCheckin($scope) {
		$scope.loading = false;
		$scope.$watch('checkin', function() {
			if($scope.checkin !== undefined && $scope.checkin.user === undefined && $scope.checkin.id !== undefined) {
				$scope.loading = true;
				Foursquare.api.checkins({checkin_id: $scope.checkin.id}).then(function(response) {
					$scope.checkin = response.data;
					$scope.loading = false;
				});
			}
		});
	})
	.controller('FoursquareSearch', function FoursquareSearch($scope, $timeout, $rootScope, Foursquare) {
		$scope.venues = [];
		$scope.geocode = {};
		$scope.loading = false;
		
		window.Foursquare = Foursquare;
		
		var search_venues = function() {
			var request = 0;
			
			return function() {
				if(request !== 0 && arguments[0] === arguments[1]) return;
				var request_id = ++request;
				
				if($scope.query !== undefined && $scope.query.length > 2) {
					$scope.loading = true;
					Foursquare.api.venues.search({
						query: $scope.query, 
						near: $scope.place
					}).then(function(response) {
						if(request !== request_id) return;
						
						$scope.loading = false;
						$scope.venues = [];
						[].push.apply($scope.venues, response.data.venues);
						$scope.geocode = response.data.geocode.feature;
					}, function() {
						if(request !== request_id) return;
						
						$scope.venues = [];
						$scope.geocode = false;
						$scope.loading = false;
					});
				}
				else {
					$scope.loading = false;
				}
			};
		} ();
		
		$scope.$watch('query', search_venues);
		$scope.$watch('place', search_venues);
	})
	.controller('FoursquareVenue', function FoursquareVenue($scope, $timeout, Foursquare) {
		$scope.loading = false;
		
		var venue_id;
		
		$scope.$watch('venue', function(venue) {
			if(venue !== undefined && venue_id === undefined) {
				venue_id = venue.id;
				$scope.loading = true;
				Foursquare.api.venues({venueId: venue.id}).then(function(response) {
					// unset venue_id after end of digest cycle to avoid infinite loop
					$timeout(function() {
						venue_id = undefined;
					}, 0);
					$scope.venue = response.data;
					$scope.loading = false;
				});
			}
			else {
				$scope.loading = false;
			}
		}, true)
	})
	.controller('FoursquareSettings', function FoursquareSettings($scope, Foursquare) {
	});
