/*
 * grunt-genx
 * https://github.com/tbashor/grunt-genx
 *
 * Copyright (c) 2012 Todd Bashor
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	
	"use strict";
	
	var genx = require('../lib/genx'),
			_ = grunt.util._;

	

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('genx', 'Generate a static site using any templating engine', function() {
		genx.generateHtmlFiles(this.file.src, this.options({dest: this.file.dest}), this.async());
	});
	
	grunt.registerMultiTask('json', 'Combine json files to form the a context object', function() {
		genx.generateJsonFiles(this.file.src, this.options({dest: this.file.dest}), this.async());
	});

};
