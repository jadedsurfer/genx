/*
 * grunt-genx
 * https://github.com/tbashor/grunt-genx
 *
 * Copyright (c) 2012 Todd Bashor
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	
	"use strict";
	
	var genx = require('../lib/genx');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('genx', 'Generate a static site using any templating engine', function() {
		//console.log(this.async);
		var done = this.async(),
				dest = this.file.dest,
				options = this.options({}),//can merge in a default object
				filepaths = [];
				//context = this;
		grunt.file.expandFiles(this.file.src).forEach(function(filepath) {
			filepaths.push(filepath);
		});
		
		grunt.util.async.forEachSeries(filepaths, function processSource(filepath, next) {
				genx.generateFile(filepath, dest, options, function(err){
					if (err) {
						grunt.warn(err);
						next(err);
					}
					next();
				});
		}, function(){
					grunt.log.ok('ALL DONE'); 
					done();
				} 
		);
		
	});

};
