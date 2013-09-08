requirejs.config({
	paths: {
		'components' : '../components', 
		'components/l20n.js/lib/l20n/platform': '../components/l20n.js/lib/client/l20n/platform'
	}, 
	shim: {
		'components/angular/angular': {
			exports: 'angular'
		}
	}
});

require(['place']);