/*
 * grunt-genx
 * https://github.com/tbashor/grunt-genx
 *
 * Copyright (c) 2012 Todd Bashor
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	
	"use strict";
	
	var genx = require('../lib/gen'),//html was working previously, rename to genx when done
			//contextGenerator = require('../lib/flatcontext'),
			manifestGenerator = require('../lib/manifest'),
			_ = grunt.util._;

	

	// ==========================================================================
	// TASKS
	// ==========================================================================

	grunt.registerMultiTask('manifest', 'Construct a json object from a directory structure', function() {
		manifestGenerator.generate(this.file.src, this.file.dest, this.options, this.async());
	});

	grunt.registerMultiTask('genx-file', 'Render html using any templating engine', function() {
		grunt.log.ok(JSON.stringify(this.file.src[0]));
		//var file = grunt.expandFiles(this.file.src);
		genx.generateFile(this.file.src[0], this.file.dest, this.options(), function(err){
			if (err) {
				throw err;
			}
		});
	});

	grunt.registerMultiTask('genx', 'Generate a static site using any templating engine', function() {
		genx.generateHtmlFiles(this.file.src, this.file.dest, this.options(), this.async());
	});
	
	/*grunt.registerMultiTask('json', 'Combine json files to form the a context object', function() {
		contextGenerator.generateSiteContext(this.file.src, this.options({dest: this.file.dest}), this.async());
	});*/

	
};
