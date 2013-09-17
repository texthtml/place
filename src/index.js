requirejs.config({
	paths: {
		'components' : '../bower_components', 
		'components/l20n.js/lib/l20n/platform': '../bower_components/l20n.js/lib/client/l20n/platform'
	}, 
	shim: {
		'components/angular/angular': {
			exports: 'angular'
		}
	}
});

require(['place']);