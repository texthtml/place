require([
	'bower_components/angular/angular',
	'moment',
	'bower_components/angularjs-foursquare/angularjs-foursquare',
	'bower_components/angularjs-webapp/angularjs-webapp',
	'bower_components/angularjs-geolocation/angularjs-geolocation',
	'bower_components/angularjs-l20n/angularjs-l20n',
	'bower_components/angular-gestures/gestures'
], function(angular, moment) {
	'use strict';

	var app = angular.module('FoursquareApp', ['thFoursquareService', 'thWebApp', 'thGeolocation', 'thL20N', 'angular-gestures'], ['thFoursquareProvider', 'thL20NContextProvider', function FoursquareAppRun(thFoursquareProvider, thL20NContextProvider) {
		var config = {
			clientId: '1BEYPWIORJCADPTGGG4P42TGWHZKERP3YTJ54L144PHJ0Q2J',
			clientSecret: 'QQ3BOXSPS1OSYUS0NZG3MT2GHWJC1LDQFI1DXVG5M21JHP0Q',
			redirectURI: 'http://' + location.hostname + '/authenticated.html'
		};

		thL20NContextProvider.registerLocales('en', ['en', 'fr', 'pt', 'es', 'de', 'ro']);

		thL20NContextProvider.linkResource(function(locale) {
			return '../locales/' + locale + '.lol';
		});

		thL20NContextProvider.requestLocales();


		config.locale = thL20NContextProvider.supportedLocales[0];

		thFoursquareProvider.config(config);

		moment.lang(navigator.language);
	}])
	.config(['$compileProvider', function($compileProvider) {
		$compileProvider.urlSanitizationWhitelist(/^\s*(https?|tel):/);
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
			link: function(scope, elm, attrs, ngModelCtrl) {
				if(attrs.type === 'radio' || attrs.type === 'checkbox') {
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
	.directive('carousel', function() {
		return {
			restrict: 'E',
			templateUrl: 'carousel.html',
			link: function(scope, elm, attrs, controller) {
				var
					source = null,
					el = elm[0],
					current_frame_id = 1,
					toolbar = el.querySelector('.carousel-toolbar'),
					wrapper = el.querySelector('.carousel-wrapper'),
					move_allowed = function(deltaX) {
						return scope.current_image !== undefined && (
							(deltaX > 0 && scope.current_image.id !== scope.previous_image.id) ||
							(deltaX < 0 && scope.current_image.id !== scope.next_image.id)
						);
					};

				scope.$watch('current_image', function(current_image) {
					if(current_image === undefined) {
						el.classList.remove('active-carousel');
						scope.frames = undefined;
					}
					else {
						el.classList.add('active-carousel');
					}
				}, true);

				scope.setSource = function(new_source) {
					source = new_source;

					if(source !== undefined) {
						var current_image = source.initial();

						scope.frames = [
							source.previous(current_image),
							current_image,
							source.next(current_image)
						];

						scope.$apply();
					}
					else {
						scope.frames = [];
					}
				};

				scope.start = function(event) {
					wrapper.style.transition = 'none';
					scope.move(event);
				};

				scope.$watch('frames', function(frames, old_frames) {
					if(frames !== undefined) {
						for(var frame_id in frames) {
							var
								frame = frames[frame_id],
								photo = frame.photo,
								size = attrs.photoSize,
								frame_el = el.querySelector('[data-frame-id="'+frame_id+'"]');

							if(photo !== undefined && photo.prefix !== undefined) {
								if(
									old_frames === undefined ||
									frame.photo.id !== old_frames[frame_id].photo.id
								) {
									frame_el.style.backgroundImage = 'url('+photo.prefix+size+photo.suffix+')';
									frame_el.classList.remove('loading');
								}
							}
							else {
								frame_el.style.backgroundImage = null;
								frame_el.classList.add('loading');
							}
						}

						scope.current_image  = frames[current_frame_id];
						scope.next_image     = frames[(current_frame_id+1)%3];
						scope.previous_image = frames[(current_frame_id+2)%3];
					}
				}, true);

				scope.move = function(event) {
					event.preventDefault();

					if(!move_allowed(event.gesture.deltaX)) {
						return;
					}

					var
						width = el.clientWidth,
						wrapper_pos = Math.max(-width, Math.min(width, event.gesture.deltaX));

					wrapper.style.transform = 'translateX('+wrapper_pos + 'px)';
				};

				scope.end  = function(event) {
					event.preventDefault();

					if(!move_allowed(event.gesture.deltaX)) {
						return;
					}

					var
						width = el.clientWidth,
						wrapper_pos = Math.max(-width, Math.min(width, event.gesture.deltaX)),
						dragged_enough = Math.abs(wrapper_pos) > width / 3,
						direction = wrapper_pos < 0 ? 'next' : 'previous';

					if(dragged_enough) {
						var
							isNext = direction === 'next',

							old_previous_el      = wrapper.querySelector('.previous-frame'),
							old_current_el       = wrapper.querySelector('.current-frame'),
							old_next_el          = wrapper.querySelector('.next-frame'),

							new_previous_el      = isNext ? old_current_el  : old_next_el,
							new_current_el       = isNext ? old_next_el     : old_previous_el,
							new_next_el          = isNext ? old_previous_el : old_current_el,

							old_current_frame_id = current_frame_id,
							new_current_frame_id = (old_current_frame_id + (isNext ? 1 : 2)) % 3,
							replaced_frame_id    = (old_current_frame_id + (isNext ? 2 : 1)) % 3,

							new_current_image    = scope.frames[new_current_frame_id],
							new_image            = source[direction](new_current_image);

						old_current_el.classList.add('carousel-target');

						new_previous_el.className       = 'carousel-frame previous-frame';
						new_current_el.className        = 'carousel-frame current-frame';
						new_next_el.className           = 'carousel-frame next-frame';

						scope.frames[replaced_frame_id] = new_image;
						current_frame_id                = new_current_frame_id;
					}

					wrapper.style.transition = null;
					wrapper.style.transform = null;
				};

				scope.toggleToolbar = function() {
					toolbar.classList.toggle('active-toolbar');
				};

				scope.stop = function() {
					scope.current_image = undefined;
				};
			}
		};
	})
	.directive('gallery', ['thFoursquare', function(thFoursquare) {
		return {
			link: function(scope, elm, attrs) {
				var
					carousel = document.querySelector(attrs.gallery);

				if(carousel === null) {
					return;
				}

				var
					initial_position,
					elements,
					images,
					fsqPhotos,
					pending,
					pending_id = 0,
					getImages = function() {
						if(images === null) {
							pending = {};
							images = {
								items: [].map.call(elements, function(el, i) {
									var photo = angular.element(el).scope().photo;

									return {
										id:    i,
										photo: photo
									};
								})
							};

							if(fsqPhotos === null) {
								images.count = images.items.length;
							}
						}

						return images;
					},
					image = function(position, delta) {
						var
							images = getImages(),
							count = images.count,
							image = {photo: {}},
							offset = images.items.length,
							limit = 30;

						if(typeof position !== 'number') {
							if(position.id === undefined) {
								pending[pending_id] = {
									position: position,
									delta: delta,
									image: {}
								};

								return pending[pending_id++].image;
							}

							position = position.id + delta;
						}

						if(count !== undefined) {
							position = (position + count) % count;
						}
						else {
							position = Math.max(0, position);
						}

						if(images.items[position] !== undefined) {
							return images.items[position];
						}

						fsqPhotos(offset, limit, function(response) {
							for(var i = 0; i < response.data.items.length; i++) {
								var
									id = offset + i,
									img = response.data.items[i];

								images.items[id] = {
									id: id,
									photo: img
								};
							}

							if(response.data.items.length !== limit) {
								images.count = images.items.length;
							}

							angular.copy(images.items[position], image);
							for(var j in pending) {
								var p = pending[j];
								if(p.position.id !== null) {
									angular.copy(images.items[p.position.id + p.delta], p.image);
									delete pending[j];
								}
							}
						});

						return image;
					},
					source = {
						initial: function() {
							return image(initial_position);
						},
						previous: function(current) {
							return image(current, -1);
						},
						next: function(current) {
							return image(current, 1);
						}
					};

				scope.$watch(attrs.gallerySourceId, function(id) {
					images = null;

					if(id !== undefined && attrs.gallerySourceType !== undefined) {
						fsqPhotos = (function(type, venue_id) {
							return function(offset, limit, data, success, failure) {
								return thFoursquare.api[type+'s'].photos({
									venueId: venue_id,
									offset: offset,
									limit : limit
								}, data, success, failure);
							};
						}) (attrs.gallerySourceType, id);
					}
					else {
						fsqPhotos = null;
					}
				});

				elm.bind('click', function(event) {
					event.preventDefault();

					var
						setCarouselSource = angular.element(carousel).scope().setSource;

					elements = elm[0].querySelectorAll('li');
					images = null;

					initial_position = -1;
					[].forEach.call(elements, function(el, i) {
						if(initial_position === -1) {
							var e = event.target;

							do {
								e = e.parentNode;
							} while(e !== null && e !== el);
							if(e === el) {
								initial_position = i;
							}
						}
					});

					setCarouselSource(source);

				});
			}
		};
	}])
	.controller('FoursquareApp', ['$scope', 'thFoursquare', 'thL20NContext', '$window', function FoursquareApp($scope, thFoursquare, thL20NContext, $window) {
		$scope.fsq = thFoursquare;

		$scope.canUploadPhoto = new XMLHttpRequest({mozSystem: true, mozAnon: true}).mozSystem;

		thL20NContext.ready(function() {
			thFoursquare.setLocale(thL20NContext.supportedLocales[0]);

			$scope.$watch('fsq.logged', function(logged) {
				if(logged) {
					$scope.me = thFoursquare.api.users();
				}
				else {
					delete $scope.me;
				}

				thL20NContext.updateData({me: $scope.me});
			});
		});

		$scope.fsqCapSize = 'cap' + Math.max($window.screen.width, $window.screen.height);
	}])
	.controller('FoursquareHome', ['$scope', 'thFoursquare', '$timeout', '$q', 'thL20NContext', '$rootScope', function FoursquareHome($scope, thFoursquare, $timeout, $q, thL20NContext, $rootScope) {
		$scope.loading = false;

		var refreshRecentCheckin = function refreshRecentCheckin() {
			var deferred = $q.defer();

			$scope.loading = true;
			thFoursquare.api.checkins.recent(function(response) {
				$scope.checkins = [];
				[].push.apply($scope.checkins, response.data);
				$scope.loading = false;
				deferred.resolve();
			}, deferred.reject);

			return deferred.promise;
		};

		$scope.refresh = function() {
			var deferred = $q.defer();

			$scope.loading = true;
			thL20NContext.ready(function() {
				$scope.refresh = refreshRecentCheckin;
				$scope.refresh().then(deferred.resolve, deferred.reject);
			});

			return deferred.promise;
		};

		var hearbeat = null;

		$scope.$watch('fsq.logged', function(logged) {
			if(logged) {
				var periodic_refresh = function(timeout) {
					var restart = function() {
						hearbeat = $timeout(function() {
							periodic_refresh(timeout);
						}, timeout);
					};

					$scope.refresh().then(restart, restart);
				};

				periodic_refresh(15*60*1000);
			}
			else {
				$scope.checkins = [];

				if(hearbeat !== null) {
					$timeout.cancel(hearbeat);
					hearbeat = null;
				}
			}
		});

		$scope.$on('fsq:new-checkin', $scope.refresh);

		$scope.openSettings = function() {
			$rootScope.$broadcast('open-settings');
		};
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
			}, function() {
				$scope.checkin.comments.items.pop();
				$scope.posting = false;
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

					alert(thL20NContext.getSync('checkin_failed'));
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
			}, function() {
				$scope.uploading = false;
			});
		};
	}])
	.controller('FoursquareSearch', ['$scope', 'thFoursquare', 'thGeolocation', 'llConfig', 'thL20NContext',
	function FoursquareSearch($scope, thFoursquare, thGeolocation, llConfig, thL20NContext) {
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
								$scope.position = thL20NContext.getSync('i_see_you');
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
	.controller('FoursquareVenue', ['$scope', 'thFoursquare',
	function FoursquareVenue($scope, thFoursquare) {
		$scope.loading = false;

		$scope.$watch('venue', function(venue) {
			if(venue !== undefined && venue.id !== undefined && venue.photos === undefined) {
				$scope.loading = true;
				thFoursquare.api.venues({venueId: venue.id}, function(response) {
					$scope.venue = response.data;
					$scope.venue.displayedHours = $scope.venue.hours || $scope.venue.popular;
					$scope.loading = false;
					$scope.replaceState();
				});
			}
			else {
				$scope.loading = false;
			}
		}, true);
	}])
	.controller('FoursquareSettings', ['$scope', 'thFoursquare', 'thGeolocation', '$rootScope',
	function FoursquareSettings($scope, thFoursquare, thGeolocation, $rootScope) {

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

		$rootScope.$on('open-settings', function() {
			if(thFoursquare.logged) {
				$scope.loading = true;
				$scope.settings = thFoursquare.api.settings.all(function(/* response */) {
					$scope.loading = false;
				});

				if($scope.$$phase === null) {
					$scope.$apply();
				}
			}
		});
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
	}])
	.filter('moment.format', function() {
		return function(value, format) {
			return moment(value).format(format);
		};
	})
	.filter('moment.fromNow', function() {
		return function(value) {
			return moment(value).fromNow();
		};
	});

	if ('MozActivity' in window) {
		app.directive('target', function() {
			return {
				restrict: 'A',
				link: function(scope, elem, attrs) {
					if (attrs.target === '_activity') {
						elem.bind('click', function(event) {
							event.preventDefault();
							var activity = new MozActivity({
								name: "view",
								data: {
									type: 'url',
									url: attrs.href
								}
							});
						});
					}
				}
			};
		});
	}

	angular.bootstrap(document.documentElement, ['FoursquareApp']);
});
