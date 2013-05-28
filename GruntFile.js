module.exports = function(grunt) {
	grunt.initConfig({
		requirejs: {
			compile: {
				options: {
					baseUrl: '.', 
					name: 'index.js', 
					mainConfigFile: 'index.js', 
					out: 'index.min.js', 
					optimize: 'uglify2'
				}
			}
		}, 
		cssjoin: {
			join: {
				files: {
					'index.all.css' : 'index.css'
				}
			}
		}, 
		cssmin: {
			compress: {
				files: {
					'index.min.css' : 'index.all.css'
				}, 
				options: {
					root: '.'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-cssjoin'); // use r.js or publish my own grunt task before commit
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	
	grunt.registerTask('index.min', function() {
		grunt.file.copy('index.html', 'index.min.html', {
			process: function(html) {
				return html.replace(/index.([a-z]{1,3})/g, 'index.min.$1');
			}
		});
	});
	
	grunt.registerTask('default', ['cssjoin', 'cssmin', 'index.min', 'requirejs']);
};