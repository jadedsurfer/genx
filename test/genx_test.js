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
	'generateFile' : {
		jade: function(test) {
			test.expect(1);
			// tests here
			var filename = 'template', 
					extension = 'jade', 
					srcDir = 'test/content/blog/posts', 
					destDir = 'test/actual/public/blog', 
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
						tags: "awesomeness",
						name: "Hello World"
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
		},
		markdown: function(test) {
			test.expect(1);
			// tests here
			var filename = 'post1', 
					extension = 'md', 
					srcDir = 'test/content/blog/posts', 
					destDir = 'test/actual/public/blog', 
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
		},
		"dust-with-options": function(test) {
			test.expect(1);
			// tests here
			var filename = 'post2', 
					extension = 'dust', 
					srcDir = 'test/content/blog/posts', 
					destDir = 'test/actual/public/blog', 
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
		},
		"no-options-no-local": function(test) {
			test.expect(1);
			// tests here
			var filename = 'post3', 
					extension = 'dust', 
					srcDir = 'test/content/blog/posts', 
					destDir = 'test/actual/public/blog', 
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
	}
};
