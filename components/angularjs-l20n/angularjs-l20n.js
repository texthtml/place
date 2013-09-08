define(function (require, exports, module) {
	'use strict';
	
	function thL20NContextProvider() {
		var ctx = require('components/l20n.js/lib/l20n').getContext();
		
		[
			'registerLocales', 
			'registerLocaleNegotiator', 
			'addResource', 
			'linkResource', 
			'addEventListener', 
			'removeEventListener', 
			'updateData', 
			'ready'
		].forEach(function(method) {
			this[method] = ctx[method].bind(ctx);
		}.bind(this));
		
		var requestLocales = [navigator.language, navigator.language.substr(0, 2)];
		
		this.supportedLocales = ctx.supportedLocales;
		
		this.requestLocales = function() {
			if(arguments.length) {
				requestLocales = arguments;
			}
			ctx.requestLocales.apply(ctx, requestLocales);
			this.supportedLocales = ctx.supportedLocales;
			requestLocales = false;
		}
		
		this.$get = ['$rootScope', function($rootScope) {
			ctx.addEventListener('ready', function() {
				$rootScope.$emit('l20n.ready');
			});
			
			if(requestLocales !== false) {
				ctx.requestLocales.apply(ctx, requestLocales);
			}
			
			return ctx;
		}];
	};
	
	
	require('components/angular/angular').module('thL20N', [], ['$provide', function($provide) {
		$provide.provider('thL20NContext', thL20NContextProvider);
	}])
	.directive('l20nId', ['thL20NContext', function L20NIdFactory(thL20NContext) {
		window.l20nctx = thL20NContext;
		return {
			restrict: 'A', 
			link: function l20nIdLinking(scope, element, attrs) {
				
				var updateText = function() {
					if(attrs.l20nId !== undefined) {
						var data = scope.$eval(attrs.l20nData), 
							string = thL20NContext.get(attrs.l20nId, data);
						
						if(attrs.l20nTarget === undefined) {
							attrs.l20nTarget = 'text';
						}
						
						if(attrs.l20nTarget === 'text') {
							element.text(string);
						}
						else if(attrs.l20nTarget === 'html') {
							element.html(string);
						}
						else {
							element.attr(attrs.l20nTarget, string);
						}
					}
				};
				
				thL20NContext.ready(function() {
					scope.$on('l20n.ready', updateText);
					
					scope.$watch(attrs.l20nId, updateText);
					scope.$watch(attrs.l20nData, updateText, true);
					
					updateText();
				});
			}
		}
	}]);
});