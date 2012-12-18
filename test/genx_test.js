"use strict";

var grunt = require('grunt'), 
		path = require('path');

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
	'TEST grunt manifest task' : {
		'manifest generator works': function(test) {
			// Tests the result of the grunt task.
			// The site.json file should be in the right place and match the expected result
			test.expect(1);
			var actual = grunt.file.read('test/actual/site.json'),
					expected = grunt.file.read('test/expected/site.json');
			test.equal(actual, expected, 'should save the generated manifest to the destination');
			test.done();
		}
	},
	'TEST grunt genx task' : {
		'markdown works': function(test) {
			// Tests the result of the grunt task.
			// The markdown file should have a token replaced,
			// be rendered into a layout,
			// and moved into the target directory.
			// uses global context.
			test.expect(1);
			// tests here
			var actual = grunt.file.read('test/actual/public/blog/post1.html'),
					expected = grunt.file.read('test/expected/post1.html');
	
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
		},
		'jade works': function(test) {
			// Tests the result of the grunt task.
			// The jade file should have a token replaced,
			// be rendered into a layout,
			// and moved into the target directory.
			// Local file adds context.
			test.expect(1);
			// tests here
			var actual = grunt.file.read('test/actual/public/blog/post4.html'),
					//The rendering engine may minify the otuput so make sure the expected file
					//really matches what will come out the templating engine
					//TODO: Figure out how to prevent dust from minifying the output
					expected = grunt.file.read('test/expected/post4.html');
	
			test.equal(actual, expected, 'should return the rendered file');
			test.done();
		}
	}
};
