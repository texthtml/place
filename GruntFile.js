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
					{src: 'components/gaia-ui-building-blocks/stable/headers/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/input_areas/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/buttons/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/switches/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/lists/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/progress_activity/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/drawer/images/**'}, 
					{src: 'components/angularjs-foursquare/images/connect-*'}, 
					{src: 'components/angularjs-foursquare/authenticated.js'}, 
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
					name: 'components/almond/almond', 
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
								.replace(/.*\/components\/requirejs\/require.js.*\n/g, '')
								.replace(/(\s*)(<\/body>)/, '$1\t<script src="/build/index.js"></script>$1$2');
						}
						else if(file === 'temp/index.css') {
							return content.replace(/([^.])\/components/g, '$1../components');
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
	
	grunt.registerTask('build',   ['cssurls', 'cssjoin', 'cssmin', 'copy', 'requirejs']);
	grunt.registerTask('package', ['clean:build', 'build', 'compress']);
	grunt.registerTask('push',    ['package', 'ffospush']);
	grunt.registerTask('default', ['build']);
};