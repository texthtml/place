require([
	'bower_components/angular/angular', 
	// 'bower_components/photoswipe/release/3.0.3/code.photoswipe-3.0.3.min', 
	'bower_components/angularjs-foursquare/angularjs-foursquare', 
	'bower_components/angularjs-webapp/angularjs-webapp', 
	'bower_components/angularjs-geolocation/angularjs-geolocation', 
	'bower_components/angularjs-l20n/angularjs-l20n'
], function(angular/*, PhotoSwipe*/) {
	'use strict';
	
	angular.module('FoursquareApp', ['thFoursquareService', 'thWebApp', 'thGeolocation', 'thL20N'], ['thFoursquareProvider', 'thL20NContextProvider', function FoursquareAppRun(thFoursquareProvider, thL20NContextProvider) {
		var config = {
			clientId: '1BEYPWIORJCADPTGGG4P42TGWHZKERP3YTJ54L144PHJ0Q2J', 
			clientSecret: 'QQ3BOXSPS1OSYUS0NZG3MT2GHWJC1LDQFI1DXVG5M21JHP0Q', 
			redirectURI: 'http://' + location.hostname + '/authenticated.html'
		};
		
		thL20NContextProvider.registerLocales('en', ['en', 'fr']);
		
		thL20NContextProvider.linkResource(function(locale) {
			return '../locales/' + locale + '.lol';
		});
		
		thL20NContextProvider.requestLocales();
		
		
		config.locale = thL20NContextProvider.supportedLocales[0];
		
		
		thFoursquareProvider.config(config);
	}])
	.directive('model', function() {
		return {
			restrict: 'A', 
			link: function(scope, elem, attrs) {
				if(attrs.type !== 'file') {
					return;
				}
				
				elem.bind('change', function() {
					scope.$apply(function() {
						scope[attrs.model] = attrs.multiple ? elem[0].files : elem[0].files[0];
					});
				});
				
				scope.$watch(attrs.model, function(file) {
					if(file === '') {
						elem.val('');
					}
				});
			}
		};
	})
	.directive('ngModelDelay', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elm, attr, ngModelCtrl) {
				if(attr.type === 'radio' || attr.type === 'checkbox') {
					return;
				}

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
	}])
	.directive('gallery', function() {
		return {
			link: function(scope, elm) {
				elm.bind('click', function(event) {
					event.preventDefault();
				// 	var 
				// 		elements = elm[0].querySelectorAll('li'), 
				// 		start_position = -1, 
				// 		images = [].map.call(elements, function(el, i) {
				// 			if(start_position === -1) {
				// 				var e = event.target;
								
				// 				do {
				// 					e = e.parentNode;
				// 				} while(e !== null && e !== el);
				// 				if(e === el) {
				// 					start_position = i;
				// 				}
				// 			}
							
				// 			return {
				// 				url: el.querySelector('a').href
				// 			};
				// 		}), 
				// 		options = {
				// 			getImageSource: function(obj){
				// 				return obj.url;
				// 			},
				// 			getImageCaption: function(obj){
				// 				return obj.caption;
				// 			}, 
				// 			loop: false, 
				// 			captionAndToolbarHide: true
				// 		}, 
				// 		gallery = PhotoSwipe.createInstance(images, options);
					
				// 	if(start_position !== -1) {
				// 		gallery.toggleToolbar = function() {
				// 			gallery.hide();
				// 			gallery.dispose();
				// 		};
				// 		gallery.show(start_position);
				// 	}
				});
			}
		};
	})
	.controller('FoursquareApp', ['$scope', 'thFoursquare', 'thL20NContext', function FoursquareApp($scope, thFoursquare, thL20NContext) {
		$scope.fsq = thFoursquare;
		
		$scope.canUploadPhoto = new XMLHttpRequest({mozSystem: true, mozAnon: true}).mozSystem;
		
		$scope.$watch('fsq.logged', function(logged) {
			if(logged) {
				$scope.me = thFoursquare.api.users();
			}
			else {
				delete $scope.me;
			}
			
			thL20NContext.updateData({me: $scope.me});
		});
	}])
	.controller('FoursquareHome', ['$scope', 'thFoursquare', function FoursquareHome($scope, thFoursquare) {
		$scope.loading = false;
		
		$scope.refresh = function refreshRecentCheckin() {
			$scope.loading = true;
			thFoursquare.api.checkins.recent(function(response) {
				$scope.checkins = [];
				[].push.apply($scope.checkins, response.data);
				$scope.loading = false;
			});
		};
		
		$scope.$watch('fsq.logged', function(logged) {
			$scope.checkins = [];
			if(logged) {
				$scope.refresh();
			}
		});
		
		$scope.$on('fsq:new-checkin', $scope.refresh);
	}])
	.controller('FoursquareCheckin', ['$scope', '$rootScope', 'llConfig', 'thFoursquare', 'thL20NContext', 
	function FoursquareCheckin($scope, $rootScope, llConfig, thFoursquare, thL20NContext) {
		$scope.loading = false;
		$scope.$watch('checkin', function() {
			if(
				$scope.checkin !== undefined && 
				$scope.checkin.id !== undefined && 
				($scope.checkin.user === undefined || $scope.checkin.comments === undefined)
			) {
				$scope.loading = true;
				thFoursquare.api.checkins({checkin_id: $scope.checkin.id}, function(response) {
					$scope.checkin = response.data;
					$scope.loading = false;
					$scope.replaceState();
				});
			}
		});
		
		$scope.posting = false;
		$scope.postComment = function() {
			if($scope.checkin.comments === undefined) {
				$scope.checkin.comments = {
					count: 1, 
					items: []
				};
			}
			var comment = {
				text: $scope.new_comment, 
				user: $scope.me, 
				createdAt: Date.now()/1000
			};
			
			var i = $scope.checkin.comments.items.push(comment) - 1;
			$scope.posting = true;
			thFoursquare.api.checkins.addcomment({
				checkin_id: $scope.checkin.id, 
				text: $scope.new_comment
			}, function(response) {
				$scope.posting = false;
				$scope.new_comment = '';
				$scope.checkin.comments.items[i] = response.data;
				
				if($scope.checkin.comments.count === 0) {
					$scope.checkin.comments.count = 1;
				}
				$scope.replaceState();
			});
		};
		
		$scope.checkingin = false;
		$scope.checkIn = function() {
			$scope.checkingin = true;
			$scope.checkin.shout = $scope.new_shout;
			$scope.checkin.createdAt = Date.now()/1000;
			
			var checkin = {
				venueId: $scope.checkin.venue.id, 
				shout: $scope.new_shout
			};
			
			var checkIn = function() {
				thFoursquare.api.checkins.add(llConfig(checkin), function(response) {
					$scope.checkingin = false;
					$scope.new_shout = '';
					$scope.checkin = response.data.checkin;
					$scope.replaceState();
					$rootScope.$broadcast('fsq:new-checkin', response.data);
				});
			};
			
			if($scope.checkin.user === undefined) {
				thFoursquare.login().then(function() {
					$scope.checkin.user = thFoursquare.api.users();
					checkIn();
				}, function() {
					$scope.checkingin = false;
					delete $scope.checkin.shout;
					delete $scope.checkin.createdAt;
					
					alert(thL20NContext.get('checkin_failed'));
				});
			}
			else {
				checkIn();
			}
		};
		
		$scope.setFile = function(element) {
			$scope.$apply(function($scope) {
				$scope.files = element.files;
			});
		};
		
		$scope.uploading = false;
		$scope.uploadPhoto = function() {
			$scope.uploading = true;
			var photo = new FormData();
			photo.append('photo', $scope.photo);
			
			$scope.photo = '';
			
			thFoursquare.api.photos.add(llConfig({checkinId: $scope.checkin.id}), photo, function(response) {
				$scope.uploading = false;
				
				for(var i = 0; i < $scope.checkin.photos.items.length; i++) {
					if(response.data.id === $scope.checkin.photos.items[i].id) {
						return;
					}
				}
				
				response.data.user = $scope.me;
				
				$scope.checkin.photos.count++;
				$scope.checkin.photos.items.push(response.data);
				
				$scope.replaceState();
			});
		};
	}])
	.controller('FoursquareSearch', ['$scope', '$timeout', 'thFoursquare', 'thGeolocation', 'llConfig', 'thL20NContext', 
	function FoursquareSearch($scope, $timeout, thFoursquare, thGeolocation, llConfig, thL20NContext) {
		$scope.venues   = [];
		$scope.geocode  = '';
		$scope.loading  = false;
		$scope.locating = false;
		$scope.located  = false;
		$scope.position = '';
		$scope.place    = '';
		$scope.query    = '';
		$scope.geolocationSupported = thGeolocation.supported;
		
		var last_request_id = 0;
		$scope.findMe = function(force) {
			if(($scope.locating === false && $scope.located === false) || force) {
				$scope.locating = true;
				$scope.located  = false;
				$scope.position = '';
				last_request_id++;
				thGeolocation.searchCurrentPosition(
					(function(current_request) {
						return function(/* position */) {
							if($scope.locating && last_request_id === current_request) {
								$scope.located  = true;
								$scope.locating = false;
								$scope.position = thL20NContext.get('i_see_you');
							}
							if($scope.$$phase === null) {
								$scope.$apply();
							}
						};
					}) (last_request_id), 
					(function(current_request) {
						return function(error) {
							if($scope.locating && last_request_id === current_request) {
								$scope.position = error.message;
							}
							$scope.locating = false;
							$scope.located  = false;
							$scope.position = '';
						};
					}) (last_request_id)
				);
				if($scope.$$phase === null) {
					$scope.$apply();
				}
			}
			else {
				$scope.locating = false;
				$scope.located  = false;
			}
		};
		
		$scope.initSearch = function() {
			if(localStorage.getItem('geolocationEnabled') === 'true') {
				$scope.findMe(true);
			}
		};
		
		var search_venues = (function() {
			var request = 0;
			
			return function() {
				if(request !== 0 && arguments[0] === arguments[1]) {
					return;
				}
				
				var request_id = ++request;
				
				if($scope.place.length > 2 || $scope.located) {
					$scope.loading = true;
					var config = $scope.located ? llConfig({
						query: $scope.query
					}) : {
						query: $scope.query, 
						near: $scope.place
					};
					thFoursquare.api.venues.search(config, function(response) {
						if(request !== request_id) {
							return;
						}
						
						$scope.loading = false;
						$scope.venues = [];
						[].push.apply($scope.venues, response.data.venues);
						$scope.geocode = response.data.geocode ? response.data.geocode.feature : undefined;
					}, function(/* error */) {
						if(request !== request_id) {
							return;
						}
						
						$scope.venues = [];
						$scope.geocode = false;
						$scope.loading = false;
					});
				}
				else {
					$scope.loading = false;
				}
			};
		}) ();
		
		$scope.$watch('query', search_venues);
		$scope.$watch('place', search_venues);
		$scope.$watch('located', search_venues);
	}])
	.controller('FoursquareVenue', ['$scope', '$timeout', 'thFoursquare', 
	function FoursquareVenue($scope, $timeout, thFoursquare) {
		$scope.loading = false;
		
		$scope.$watch('venue', function(venue) {
			if(venue !== undefined && venue.id !== undefined && venue.photos === undefined) {
				$scope.loading = true;
				thFoursquare.api.venues({venueId: venue.id}, function(response) {
					$scope.venue = response.data;
					$scope.loading = false;
					$scope.replaceState();
				});
			}
			else {
				$scope.loading = false;
			}
		}, true);
	}])
	.controller('FoursquareSettings', ['$scope', 'thFoursquare', 'thGeolocation', 
	function FoursquareSettings($scope, thFoursquare, thGeolocation) {
		
		$scope.geolocationSupported    = thGeolocation.supported;
		$scope.geolocationEnabled      = localStorage.getItem('geolocationEnabled')      === 'true';
		$scope.geolocationHighAccuracy = localStorage.getItem('geolocationHighAccuracy') !== 'false';
		
		$scope.$watch('geolocationEnabled', function(geolocationEnabled) {
			localStorage.setItem('geolocationEnabled', geolocationEnabled);
			if(!geolocationEnabled) {
				thGeolocation.stopWatching();
			}
			else if(!thGeolocation.watching) {
				thGeolocation.watchPosition();
			}
		});
		
		$scope.$watch('geolocationHighAccuracy', function(geolocationHighAccuracy) {
			localStorage.setItem('geolocationHighAccuracy', geolocationHighAccuracy);
			thGeolocation.config({
				required_accuracy: 2000, 
				enableHighAccuracy: geolocationHighAccuracy
			});
		});
		
		$scope.loading = false;
		
		function registerSettingHandler(settingName) {
			$scope.$watch('settings.'+settingName, function(settingValue, oldValue) {
				if(settingValue !== undefined && oldValue !== undefined) {
					$scope.loading = true;
					thFoursquare.api.settings.set({setting_id: settingName, value: settingValue}, function() {
						$scope.loading = false;
					});
				}
			});
		}
		
		$scope.$watch('fsq.logged', function(logged) {
			if(!logged) {
				delete $scope.settings;
			}
		});
		
		[	'sendBadgesToTwitter' , 'sendMayorshipsToTwitter', 
			'sendBadgesToFacebook', 'sendMayorshipsToFacebook', 
			'receivePings'        , 'receiveCommentPings'
		].forEach(registerSettingHandler);
		
		$scope.loadSettings = function() {
			if(thFoursquare.logged) {
				$scope.loading = true;
				$scope.settings = thFoursquare.api.settings.all(function(/* response */) {
					$scope.loading = false;
				});
				
				if($scope.$$phase === null) {
					$scope.$apply();
				}
			}
		};
	}])
	.factory('llConfig', ['thGeolocation', function(thGeolocation) {
		return function(config) {
			if(thGeolocation.position !== undefined && thGeolocation.position.coords !== undefined) {
				config.ll     = thGeolocation.position.coords.latitude + ',' + thGeolocation.position.coords.longitude;
				config.llAcc  = thGeolocation.position.coords.accuracy;
				config.alt    = thGeolocation.position.coords.altitude;
				config.altAcc = thGeolocation.position.coords.altitudeAccuracy;
			}
			return config;
		};
	}]);
	
	angular.bootstrap(document.documentElement, ['FoursquareApp']);
});