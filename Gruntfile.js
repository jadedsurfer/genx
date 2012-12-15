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
		json: {
			test:{
				src: ['test/content/blog/**/*.json'],
				dest: 'test/actual/public/blog/site.json',
				options: {
					title: "Site Title",
					author: "Your Name",
					tags: "cool, stuff"
				}
			}
		},
		genx: {
			test:{
				src: ['test/content/blog/posts/*.dust', 'test/content/blog/posts/*.jade', 'test/content/blog/posts/*.md'],
				dest: 'test/actual/public/blog/',
				options: {
					context: 'test/actual/site.json'
				}
			}
		},
		"genx-file": {
			test:{
				src: 'test/content/blog/posts/post1.dust',
				dest: 'test/actual/public/blog/',
				options: {
					"title": "default post name",
					"author": "Your Name",
					"tags": "cool, stuff",
					"layout": "test/partials/post.dust",
					"blog md": "something at blog level-inside",
					"metadata": "pages context",
					"nav": [
						"page 1",
						"page 2",
						"page 3"
					],
					"md1": "resources context",
					"template": "templates/post",
					"tile": "Hello World",
					"other": "something else",
					"name": "post 4 name"
				}
			}
		},
		Xsite: {
			test:{
				src: ['test/content'],
				dest: 'test/actual/site.json',
				options: {
					title: "Site Title",
					author: "Your Name",
					tags: "cool, stuff",
					layout: 'test/partials/post.dust'
				}
			}
		},
		manifest:{

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
	grunt.registerTask('test-genx-file', ['clean', 'genx-file:test']);
	grunt.registerTask('test-json', ['clean', 'json']);
	grunt.registerTask('test-site', ['clean', 'site']);
	grunt.registerTask('run', ['clean','genx:test']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test-genx-file']);

};
