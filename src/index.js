requirejs.config({
	paths: {
		'components' : '../components'
	}, 
	shim: {
		'components/angular/angular': {
			exports: 'angular'
		}
	}
});

require(['place']);