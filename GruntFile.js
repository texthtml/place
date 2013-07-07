module.exports = function(grunt) {
	grunt.initConfig({
		ffospush: {
			app: {
				appId: 'place.texthtml.net', 
				zip: 'place.zip'
			}
		}, 
		compress: {
			package: {
				options: {
					archive: 'place.zip'
				}, 
				files: [
					{src: 'components/requirejs/require.js'}, 
					{src: 'components/gaia-ui-building-blocks/stable/header/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/input_areas/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/buttons/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/stable/switches/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/lists/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/progress_activity/images/**'}, 
					{src: 'components/gaia-ui-building-blocks/unstable/drawer/images/**'}, 
					{src: 'components/angularjs-foursquare/images/connect-*'}, 
					{src: 'app/**'}
				]
			}
		}, 
		requirejs: {
			compile: {
				options: {
					almond: true, 
					wrap: true, 
					baseUrl: 'src', 
					name: 'index', 
					mainConfigFile: 'src/index.js', 
					out: 'build/index.js', 
					optimize: 'uglify2', 
					preserveLicenseComments: false, 
					generateSourceMaps: true
					
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
						return content;
					}
				}, 
				files: [
					{expand: true, cwd: 'src', src: 'index.html', dest: 'build/'}, 
					{expand: true, cwd: 'src', src: 'images/**', dest: 'build/'}, 
					{expand: true, cwd: 'src', src: 'manifest.webapp', dest: 'build/'}
				]
			}
		}, 
		cssjoin: {
			join: {
				files: {
					'temp/index.css' : 'src/index.css'
				}
			}
		}, 
		cssmin: {
			compress: {
				files: {
					'build/index.css' : 'temp/index.css'
				}, 
				options: {
					root: '.'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-cssjoin'); // use r.js or publish my own grunt task before commit
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-firefoxos');
	
	grunt.registerTask('build',   ['cssjoin', 'cssmin', 'copy', 'requirejs']);
	grunt.registerTask('package', ['build', 'compress']);
	grunt.registerTask('push',    ['package', 'ffospush']);
	grunt.registerTask('default', ['push']);
};