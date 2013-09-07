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
		'components/angularjs-geolocation/angularjs-geolocation': ['components/angular/angular']
	}
});

require(['place']);