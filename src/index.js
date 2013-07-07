requirejs.config({
	paths: {
		'components' : '../components'
	}, 
	shim: {
		'components/angular/angular': {
			exports: 'angular'
		}, 
		'components/angularjs-foursquare/angularjs-foursquare':   ['components/angular/angular'], 
		'components/angularjs-webapp/angularjs-webapp':           ['components/angular/angular'], 
		'components/angularjs-geolocation/angularjs-geolocation': ['components/angular/angular'], 
		'components/photoswipe/release/3.0.3/lib/klass.min': {
			exports: 'klass'
		}, 
		'components/photoswipe/release/3.0.3/code.photoswipe-3.0.3.min': {
			deps: ['components/photoswipe/release/3.0.3/lib/klass.min'], 
			exports: 'Code.PhotoSwipe'
		}
	}
});

require(['place']);