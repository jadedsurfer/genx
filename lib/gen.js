/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

//"use strict";

var grunt = require('grunt'),
		cons = require('consolidate-build'), 
		path = require('path'), 
		_ = grunt.util._, 
		util = require('./util');

grunt.file.defaultEncoding = 'utf8';

var siteContext = {};

//Uses the grunt configuration to generate html files
function generateHtmlFiles(src, dest, options, done){
	var filepaths = util.expandFiles(src);
	//grunt.log.ok(JSON.stringify(options));
	siteContext = getSiteContext(options.context);
  grunt.util.async.forEachSeries(
		filepaths, 
		function processSource(filepath, next) {
			grunt.log.ok("Processing " + filepath + "\n");
			var fileContext = getContext(filepath, options.useNearest);
			//grunt.log.ok(JSON.stringify(fileContext));
			generateFile(filepath, dest, fileContext, function(err){
				if (err) {
					grunt.warn(err);
					next(err);
				}
				next();
			});
		}, 
		function(){
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}

function getSiteContext(filepath){
	grunt.log.ok(filepath);
	try {
		return grunt.file.readJSON(filepath);
	} catch(error){
		return {};
	}
}

//Gets context for a content file from a siteContext file
//Assumes the siteContext has already been fetched
function getContext(contentPath, useNearest){
	try {
		var name = util.getFileName(contentPath), 
				contextPath = path.join(util.getDirectoryPath(contentPath), name + '.json'),
				context = {};
	
		if (!_.isUndefined(siteContext.files[contextPath])) {
			context = siteContext.files[contextPath].contents;
		} else if (useNearest){
			//TODO: try to find the nearest matching context up the tree
			//doc this option for the grunt file
		}
	} catch(error){
		grunt.log.error(error);
	} finally {
		return context;
	}
}

//Renders and writes a html file to a destination directory
function generateFile(contentPath, destinationDir, context, callback) {
	//TODO: make destination optional
	try {
		grunt.log.ok(">>Generating " + contentPath + "\n");
		//grunt.log.ok(JSON.stringify(context));
		var engine = util.getEngineOf(contentPath), 
				name = util.getFileName(contentPath), 
				destPath = path.join(destinationDir, name + '.html'),
				layout = context.layout;

		function writeFile(contents) {
			grunt.file.write(destPath, contents);
			callback();
		}

		function renderLayout(contents) {
			context.contents = contents;
			render(util.getEngineOf(layout), layout, context, writeFile);
		}

		if (_.isUndefined(layout)) {
			render(engine, contentPath, context, writeFile);
		} else {
			render(engine, contentPath, context, renderLayout);
		}
	} catch(error){
		callback(error);
	}
}

//Renders the file using the specified engine
function render(engine, filepath, context, callback) {
	grunt.log.debug("Rendering " + filepath + "\n");
	cons[engine](filepath, context, function(err, html) {
		if (err)
			throw err
		callback(html);
	});
}

exports.generateHtmlFiles = generateHtmlFiles;
exports.generateFile = generateFile;