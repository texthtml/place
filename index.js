window.module = angular.module('FoursquareApp', ['WebApp', 'FoursquareService'])
	.config(function FoursquareAppRun(FoursquareProvider) {
		var config = {
			'place.texthtml.net' : {
				clientId: 'BPZJXWFV0BBYQTIC04N34Q2QIRKKULRQIGX0OVNWALFSNFEI', 
				clientSecret: 'ZF3DCPSVCW4VZFTVUVOKRGXGMSLQWTXER24JS2BJATDKEMHI'
			}, 
			'place.webapp.127.0.0.1.xip.io' : {
				clientId: 'KUSZIXIYTQ252MLOAXHMFTTQOSMJS14G544EJA3EKTRUVRB4', 
				clientSecret: '2YKQWTLKJBYTE4ASWIGEZ5ERU4N3GN4AQCQ5P2O0SWVKBYFY'
			}, 
			'place.webapp.192.168.1.66.xip.io' : {
				clientId: 'WNFGTGGFPP1PIROYTCGCXZUZEYRE4L0204XRR32C4ACHRBCD', 
				clientSecret: 'EXT2OVJVZZI0RGO34DPKT4MZ3KHYHRJQNDQ13OXPAQMCFCY1'
			}
		}[location.hostname];
		config.redirectURI = document.location.href + '?authenticated';
		FoursquareProvider.config(config);
	})
	.directive('model', function() {
		return {
			restrict: 'A', 
			link: function(scope, elem, attrs) {
				if(attrs.type !== 'file') {
					return;
				}
				
				elem.bind('change', function(event) {
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
	.directive('gallery', function() {
		return {
			link: function(scope, elm, attr) {
				elm.bind('click', function(event) {
					var 
						elements = elm[0].querySelectorAll('li'), 
						start_position = -1, 
						images = [].map.call(elements, function(el, i) {
							if(start_position === -1) {
								var e = event.target;
								
								do {
									e = e.parentNode;
								} while(e !== null && e !== el);
								if(e === el) {
									start_position = i;
								}
							}
							
							return {
								url: el.querySelector('a').href
							};
						}), 
						options = {
							getImageSource: function(obj){
								return obj.url;
							},
							getImageCaption: function(obj){
								return obj.caption;
							}, 
							loop: false, 
							captionAndToolbarHide: true
						}, 
						gallery = Code.PhotoSwipe.createInstance(images, options);
					
					if(start_position !== -1) {
						gallery.toggleToolbar = function() {
							gallery.hide();
							gallery.dispose();
						};
						gallery.show(start_position);
					}
				});
			}
		}
	})
	.controller('FoursquareApp', function FoursquareApp($scope, $rootScope, Foursquare) {
		$scope.fsq = Foursquare;
		
		$scope.canUploadPhoto = new XMLHttpRequest({mozSystem: true, mozAnon: true}).mozSystem;
		
		$scope.setVenue = function(venue) {
			$rootScope.$broadcast('venue', venue);
		};
		
		$scope.$watch('fsq.logged', function(logged) {
			if(logged) {
				$scope.me = Foursquare.api.users();
			}
			else {
				delete $scope.me;
			}
		});
	})
	.controller('FoursquareHome', function FoursquareHome($scope, Foursquare) {
		$scope.loading = false;
		
		$scope.refresh = function refreshRecentCheckin() {
			$scope.loading = true;
			Foursquare.api.checkins.recent(function(response) {
				$scope.checkins = [];
				[].push.apply($scope.checkins, response.data);
				$scope.loading = false;
			});
		}
		
		$scope.$watch('fsq.logged', function(logged) {
			$scope.checkins = [];
			if(logged) {
				$scope.refresh();
			}
		});
		
		$scope.$on('fsq:new-checkin', $scope.refresh);
	})
	.controller('FoursquareCheckin', function FoursquareCheckin($scope, $rootScope) {
		$scope.loading = false;
		$scope.$watch('checkin', function() {
			if(
				$scope.checkin !== undefined && 
				$scope.checkin.id !== undefined && 
				($scope.checkin.user === undefined || $scope.checkin.comments === undefined)
			) {
				$scope.loading = true;
				Foursquare.api.checkins({checkin_id: $scope.checkin.id}, function(response) {
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
				}
			}
			var comment = {
				text: $scope.new_comment, 
				user: $scope.me, 
				createdAt: Date.now()/1000
			};
			
			var i = $scope.checkin.comments.items.push(comment) - 1;
			
			$scope.posting = true;
			Foursquare.api.checkins.addcomment({
				checkin_id: $scope.checkin.id, 
				text: $scope.new_comment
			}, function(response) {
				$scope.posting = false;
				$scope.new_comment = '';
				$scope.checkin.comments.items[i] = response.data;
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
			
			Foursquare.api.checkins.add(checkin, function(response) {
				$scope.checkingin = false;
				$scope.new_shout = '';
				$scope.checkin = response.data.checkin;
				$scope.replaceState();
				$rootScope.$broadcast('fsq:new-checkin', response.data);
			});
		};
		
		$scope.setFile = function(element) {
			$scope.$apply(function($scope) {
				$scope.files = element.files;
			});
		};
		
		$scope.uploading = false;
		$scope.uploadPhoto = function() {
			$scope.uploading = true;
			var photo = new FormData;
			photo.append('photo', $scope.photo);
			
			$scope.photo = '';
			
			Foursquare.api.photos.add({checkinId: $scope.checkin.id}, photo, function(response) {
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
					}, function(response) {
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
		
		$scope.$watch('venue', function(venue) {
			if(venue !== undefined && venue.id !== undefined && venue.photos === undefined) {
				$scope.loading = true;
				Foursquare.api.venues({venueId: venue.id}, function(response) {
					$scope.venue = response.data;
					$scope.loading = false;
					$scope.replaceState();
				});
			}
			else {
				$scope.loading = false;
			}
		}, true)
	})
	.controller('FoursquareSettings', function FoursquareSettings($scope, Foursquare) {
		$scope.loading = false;
		
		function registerSettingHandler(settingName) {
			$scope.$watch('settings.'+settingName, function(settingValue, oldValue) {
				if(settingValue !== undefined && oldValue !== undefined) {
					$scope.loading = true;
					Foursquare.api.settings.set({setting_id: settingName, value: settingValue}, function() {
						$scope.loading = false;
					});
				}
			});
		}
		
		[	'sendBadgesToTwitter' , 'sendMayorshipsToTwitter', 
			'sendBadgesToFacebook', 'sendMayorshipsToFacebook', 
			'receivePings'        , 'receiveCommentPings', 
		].forEach(registerSettingHandler);
		
		$scope.loadSettings = function() {
			$scope.loading = true;
			$scope.settings = Foursquare.api.settings.all(function(response) {
				$scope.loading = false;
			});
			
			if($scope.$$phase === null) {
				$scope.$apply();
			}
		}
	});
