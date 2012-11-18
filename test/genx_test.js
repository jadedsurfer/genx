"use strict";

var grunt = require('grunt'),
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
  setUp: function(done) {
    // setup here
    done();
  },
  'generateFile': function(test) {
    test.expect(1);
    // tests here
    var src = 'test/content/blog/posts/post2.dust',
				dest = 'test/public/blog/',
				target = 'test/public/blog/post2.html',
				expected = grunt.file.read('test/expected/post2.html');
				function done(err){
					if (err){
						grunt.warn(err);
						test.done(err);
					}
					test.equal(grunt.file.read(target), expected, 'should return the rendered file');
					test.done();
				}
		genx.generateFile(src, dest, {}, done);
  }
};
