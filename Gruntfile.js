/*
 * grunt-genx
 * https://github.com/tbashor/genx
 *
 * Copyright (c) 2012 Todd Bashor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'lib/gen.js',
				'lib/manifest.js',
				'<%= nodeunit.tests %>',
			],
			options: {
				jshintrc: '.jshintrc',
			},
		},
		
		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['test/actual/public/blog/*', 'test/actual/test-result/*', 'test/actual/public/blog/site.json'],
		},

		// Configuration to be run (and then tested).
		manifest:{
			test:{
				root: 'test/content',
				dest: 'test/actual/site.json',
				options: {
					context: {
						title: "Site Title",
						author: "Your Name",
						tags: "site, cool, stuff",
						layout: 'test/partials/post.dust'
					},
					duringWalk: ['lib/addcontents.js'],
					postWalk: ['lib/mergecontexts.js']
				}
			}
		},
		genx: {
			test:{
				src: ['test/content/blog/posts/*.dust', 'test/content/blog/posts/*.jade', 'test/content/blog/posts/*.md'],
				dest: 'test/actual/public/blog/',
				options: {
					context: 'test/actual/site.json',
					useNearestContext: true
				}
			}
		},
		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js'],
		},

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.

	grunt.registerTask('test-genx', ['clean', 'genx:test']);
	grunt.registerTask('test-manifest', ['clean', 'manifest:test']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'clean', 'manifest:test', 'genx:test']);

};
