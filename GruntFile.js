module.exports = function(grunt) {
	grunt.initConfig({
		ffospush: {
			app: {
				appId: 'place.texthtml.net', 
				zip: 'build/place.zip'
			}
		}, 
		compress: {
			package: {
				options: {
					archive: 'build/place.zip'
				}, 
				files: [
					{src: 'bower_components/gaia-ui-building-blocks/style/headers/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style/input_areas/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style/buttons/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style/switches/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style_unstable/lists/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style_unstable/progress_activity/images/**'}, 
					{src: 'bower_components/gaia-ui-building-blocks/style_unstable/drawer/images/**'}, 
					{src: 'bower_components/angularjs-foursquare/images/connect-*'}, 
					{src: 'bower_components/angularjs-foursquare/authenticated.js'}, 
					{src: 'locales/**'}, 
					{src: 'build/images/**'}, 
					{src: 'build/index.*'}, 
					{src: 'build/authenticated.html'}, 
					{expand: true, src: 'build/manifest.webapp', dest: '/', flatten: true}
				]
			}
		}, 
		requirejs: {
			compile: {
				options: {
					almond: true, 
					wrap: true, 
					baseUrl: 'src', 
					name: 'bower_components/almond/almond', 
					include: 'index', 
					mainConfigFile: 'src/index.js', 
					out: 'build/index.js', 
					optimize: 'uglify2', 
					preserveLicenseComments: false
					
				}
			}
		}, 
		copy: {
			main: {
				options: {
					processContent: function(content, file) {
						if(file === 'src/manifest.webapp') {
							return content.replace(/\/src\//g, '/build/');
						}
						else if(file === 'manifest.webapp') {
							return content.replace(/web/g, 'privileged');
						}
						else if(file === 'src/index.html') {
							return content
								.replace(/.*\/bower_components\/requirejs\/require.js.*\n/g, '')
								.replace(/(\s*)(<\/body>)/, '$1\t<script src="/build/index.js"></script>$1$2');
						}
						else if(file === 'temp/index.css') {
							return content.replace(/([^.])\/bower_components/g, '$1../components');
						}
						return content;
					}, 
					processContentExclude: ['**/images/**']
				}, 
				files: [
					{expand: true, cwd: 'src', src: 'index.html', dest: 'build/'}, 
					{expand: true, cwd: 'src', src: 'authenticated.html', dest: 'build/'}, 
					{expand: true, cwd: 'src', src: 'images/**', dest: 'build/'}, 
					{expand: true, cwd: 'src', src: 'manifest.webapp', dest: '.'}, 
					{expand: true, cwd: '.', src: 'manifest.webapp', dest: 'build/'}, 
					{expand: true, cwd: 'temp', src: 'index.css', dest: 'build/'}
				]
			}, 
			angular: {
				options: {
					processContent: function(content, file) {
						return content
							.replace('new XHR()', 'new XHR({mozSystem: true})')
							.replace(
								'return isObject(d) && !isFile(d) ? toJson(d) : d;', 
								'return isObject(d) && !isFile(d)  && toString.apply(d) !== \'[object FormData]\'? toJson(d) : d;'
							);
					}
				}, 
				files: [
					{expand: true, cwd: 'bower_components', src: 'angular/angular.js', dest: 'temp/'}
				]
			}
		}, 
		cssmin: {
			compress: {
				files: {
					'temp/index.css' : 'temp/index.all.css'
				}, 
				options: {
					root: 'src'
				}
			}
		}, 
		cssjoin: {
			join: {
				files: {
					'temp/index.all.css' : 'temp/index.urls.css'
				}
			}
		}, 
		cssurls: {
			import: {
				options: {
					targetDir: 'build', 
					importDir: 'temp/import'
				}, 
				files: {
					'temp/index.urls.css': 'src/index.css'
				}
			}
		}, 
		clean: {
			temp:    ['temp'], 
			build:   ['build'], 
			package: ['place.zip']
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-cssjoin');
	grunt.loadNpmTasks('grunt-css-urls');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-firefoxos');
	
	grunt.registerTask('angular', ['copy:angular']);
	grunt.registerTask('build',   ['cssurls', 'cssjoin', 'cssmin', 'angular', 'copy:main', 'requirejs']);
	grunt.registerTask('package', ['clean:build', 'build', 'compress']);
	grunt.registerTask('push',    ['package', 'ffospush']);
	grunt.registerTask('default', ['build']);
};