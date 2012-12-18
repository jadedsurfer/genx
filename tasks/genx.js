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
			manifest = require('../lib/manifest');

	// ==========================================================================
	// TASKS
	// ==========================================================================

	grunt.registerMultiTask('manifest', 'Construct a json object from a directory structure', function() {
		manifest.generate(this, this.async());
	});

	grunt.registerMultiTask('genx', 'Generate a static site using any templating engine', function() {
		genx.generateHtmlFiles(this, this.async());
	});
	
};
