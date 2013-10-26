requirejs.config({
	paths: {
		'bower_components/angular' : '../temp/angular', 
		'bower_components' : '../bower_components', 
		'bower_components/l20n.js/lib/l20n/platform': '../bower_components/l20n.js/lib/client/l20n/platform'
	}, 
	shim: {
		'bower_components/angular/angular': {
			exports: 'angular'
		}, 
		'bower_components/angular-gestures/gestures': {
			deps: ['bower_components/angular/angular']
		}
	}, 
	map: {
		'*': {
			'bower_components/angular-gestures/gestures': 'quiet-gestures'
		}, 
		'quiet-gestures': {
			'bower_components/angular-gestures/gestures': 'bower_components/angular-gestures/gestures'
		}
	}
});

require(['place']);