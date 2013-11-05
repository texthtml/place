module.exports = function(grunt) {
	grunt.initConfig({
		ffospush: {
			app: {
				appId: 'place.texthtml.net', 
				zip: 'temp/place.zip'
			}
		}, 
		compress: {
			package: {
				options: {
					archive: 'temp/place.zip'
				}, 
				files: [
					{cwd: 'build/', expand: true, src: '**', dest: '/'}
					// {expand: true, src: 'build/manifest.webapp', dest: '/', flatten: true}
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
					include: '../temp/index', 
					mainConfigFile: 'temp/index.js', 
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
							return content.replace(/web/g, 'privileged').replace(/\/build\//g, '/');
						}
						else if(file === 'temp/index.css') {
							return content.replace(/\.\.\/bower_components/g, 'bower_components');
						}
						else if(file === 'src/index.html') {
							return content
								.replace(/.*\/bower_components\/requirejs\/require.js.*\n/g, '')
								.replace(/(\s*)(<\/body>)/, '$1\t<script src="index.js"></script>$1$2');
						}
						else if(file === 'temp/index.css') {
							return content.replace(/([^.])\/bower_components/g, '$1../components');
						}
						return content;
					}, 
					processContentExclude: ['**/images/**']
				}, 
				files: [
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style/headers/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style/input_areas/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style/buttons/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style/switches/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style_unstable/lists/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style_unstable/progress_activity/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/gaia-ui-building-blocks/style_unstable/drawer/images/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/angularjs-foursquare/images/connect-*'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'bower_components/angularjs-foursquare/authenticated.js'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'locales/**'}, 
					{expand: true, dest: 'build/', cwd: '.',    src: 'manifest.webapp'}, 
					{expand: true, dest: 'build/', cwd: 'src',  src: 'index.html'}, 
					{expand: true, dest: 'build/', cwd: 'src',  src: 'authenticated.html'}, 
					{expand: true, dest: 'build/', cwd: 'src',  src: 'images/**'}, 
					{expand: true, dest: 'build/', cwd: 'temp', src: 'index.css'}, 
					{expand: true, dest: '.',      cwd: 'src',  src: 'manifest.webapp'}, 
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
			}, 
			config: {
				options: {
					processContent: function(content, file) {
						return content
							.replace('1BEYPWIORJCADPTGGG4P42TGWHZKERP3YTJ54L144PHJ0Q2J', 'R4MYVBHKVMCNR0MAB5YTWRIJ5Z2ROR3R2DWRDTC1EOQCKEEI')
							.replace('QQ3BOXSPS1OSYUS0NZG3MT2GHWJC1LDQFI1DXVG5M21JHP0Q', 'GZ2TX5NP0VX3EV1CSACE455GKE3CYLHMIHHJKDUX0LWGJSCN')
							.replace('http://\' + location.hostname + \'/authenticated.html', 'http://place.texthtml.net/authenticated.html')
							.replace('require([\'place\']);', 'require([\'../temp/place\']);')
							.replace(/\.\.\/locales/g, 'locales');
					}
				}, 
				files: [
					{expand: true, cwd: 'src', src: 'index.js', dest: 'temp/'}, 
					{expand: true, cwd: 'src', src: 'place.js', dest: 'temp/'}
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
	grunt.registerTask('build',   ['cssurls', 'cssjoin', 'cssmin', 'copy:config', 'angular', 'copy:main', 'requirejs']);
	grunt.registerTask('package', ['clean:build', 'build', 'compress']);
	grunt.registerTask('push',    ['package', 'ffospush']);
	grunt.registerTask('default', ['build']);
};