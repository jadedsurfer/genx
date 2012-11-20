"use strict";

var grunt = require('grunt'), 
		path = require('path'),
		genx = require('../lib/genx');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports['genx'] = {
	setUp : function(done) {
		// setup here
		done();
	},
	'TEST generateFile': {
		'markdown works': function(test) {
			// Unit tests the generateFile function.
			// Simulates the result of the grunt task.
			// Use markdown as the templating engine.
			test.expect(1);
			// tests here
			var filename = 'post1', 
					extension = 'md', 
					srcDir = 'test/content/blog/posts', 
					destDir = 'test/actual/test-result', 
					src = path.join(srcDir, filename + '.' + extension), 
					target = path.join(destDir, filename + '.html'),
					//The rendering engine may minify the otuput so make sure the expected file
					//really matches what will come out the templating engine
					//TODO: Figure out how to prevent dust from minifying the output
					expected = grunt.file.read('test/expected/' + filename + '.html'), 
					options = {
						layout: 'test/partials/post.dust',
						title: "Site Title",
						author: "Your Name",
						tags: "awesomeness"
					};
	
			function done(err) {
				if (err) {
					grunt.warn(err);
					test.done(err);
				}
				test.equal(grunt.file.read(target), expected, 'should return the rendered file');
				test.done();
			}
	
			genx.generateFile(src, destDir, options, done);
		}
	},
	'TEST grunt task' : {
		'jade works': function(test) {
			// Tests the result of the grunt task.
			// The jade file should have a token replaced,
			// be rendered into a layout,
			// and moved into the target directory.
			// Local file adds context.
			test.expect(1);
			// tests here
			var actual = grunt.file.read('test/actual/public/blog/template.html'),
					//The rendering engine may minify the otuput so make sure the expected file
					//really matches what will come out the templating engine
					//TODO: Figure out how to prevent dust from minifying the output
					expected = grunt.file.read('test/expected/template.html');
	
			test.equal(actual, expected, 'should return the rendered file');
			test.done();
		},
		"dust works": function(test) {
			// Tests the result of the grunt task.
			// The dust file should have a token replaced,
			// be rendered into a layout,
			// and moved into the target directory.
			// Local file overrides some context.
			test.expect(1);
			// tests here
			var actual = grunt.file.read('test/actual/public/blog/post2.html'),
					//The rendering engine may minify the otuput so make sure the expected file
					//really matches what will come out the templating engine
					//TODO: Figure out how to prevent dust from minifying the output
					expected = grunt.file.read('test/expected/post2.html');
	
			test.equal(actual, expected, 'should return the rendered file');
			test.done();
		},
		"dust with no related json works": function(test) {
			// Tests the result of the grunt task.
			// This content file doesn't have a corresponding local json file.
			// The dust file should have a token replaced,
			// be rendered into a layout,
			// and moved into the target directory.
			test.expect(1);
			// tests here
			var actual = grunt.file.read('test/actual/public/blog/post3.html'),
					//The rendering engine may minify the otuput so make sure the expected file
					//really matches what will come out the templating engine
					//TODO: Figure out how to prevent dust from minifying the output
					expected = grunt.file.read('test/expected/post3.html');
	
			test.equal(actual, expected, 'should return the rendered file');
			test.done();
		}
	}
};
