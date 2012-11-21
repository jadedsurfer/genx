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
			_ = grunt.util._,
			extend = require('node.extend');

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
	
	grunt.registerMultiTask('json', 'Combine json files to form the a context object', function() {
		//console.log(this.async);
		var done = this.async(),
				dest = this.file.dest,
				options = this.options({}),//can merge in a default object
				filepaths = [],
				siteContext = options;
				//context = this;
		grunt.file.expandFiles(this.file.src).forEach(function(filepath) {
			filepaths.push(filepath);
		});
		
		grunt.util.async.forEachSeries(filepaths, function processSource(filepath, next) {
			
				genx.generateJSON(filepath, dest, options, siteContext, function(err, newContext){
					//console.log(siteContext);
					//console.log(newContext);
					extend(true, siteContext,newContext);
					if (err) {
						grunt.warn(err);
						next(err);
					}
					next();
				});
		}, function(){
					grunt.file.write(dest, JSON.stringify(siteContext));
					grunt.log.ok('ALL DONE'); 
					done();
				} 
		);
		
	});

};
