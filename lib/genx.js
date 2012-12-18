/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

"use strict";

var grunt = require('grunt'),
		cons = require('consolidate-build'), 
		path = require('path'), 
		_ = grunt.util._, 
		util = require('./util');

grunt.file.defaultEncoding = 'utf8';

var siteContext = {},
		taskOptions = {},
		useNearestContext = false,
		destination = '';


function writeFile(contents, destPath) {
	try {
		grunt.file.write(destPath, contents);
	} catch(error){
		if (error) {
			throw error;
		}
	}
}

//Generates a path to the destination html file
function getHtmlFileDestination(filePath){
	var name = util.getFileName(filePath);
	return path.join(destination, name + '.html');
}

//Renders the file using the specified engine
function render(filepath, context, callback) {
	grunt.log.debug("Rendering " + filepath + "\n");
	var engine = util.getEngineOf(filepath);
	cons[engine](filepath, context, function(err, html) {
		callback(err, html);
	});
}

function getContextFilePath(contentPath){
	var name = util.getFileName(contentPath);
	return path.join(util.getDirectoryPath(contentPath), name + '.json');
}

//Gets context for a content file from a siteContext file
//Assumes the siteContext has already been fetched
function getFileContext(contentPath){
	var contextPath = getContextFilePath(contentPath),
			parent = '';

	try {
		if (!_.isUndefined(siteContext.files[contextPath])) {
			return siteContext.files[contextPath].context;
		} else if (useNearestContext){
			//TODO: try to find the nearest matching context up the tree
			//doc this option for the grunt file
			parent = util.getDirectoryPath(contentPath)+'/'+util.getParentDirectory(contentPath);
			grunt.log.debug(parent);
			if (parent !== '.'){
				return getFileContext(parent);
			} else {
				grunt.log.debug('ran out of parents');
				return {};
			}
		}
	} catch(error){
		grunt.log.error(error);
		return {};
	}
}

//Renders a html file with layout if available
function generateFile(contentPath, callback) {
	grunt.log.debug(">>Generating " + contentPath + "\n");
	var fileContext = getFileContext(contentPath),
			layout = fileContext.layout;

	//Returns the rendered file to the caller or
	//wraps the contents in a layout then returns
	function processResult(error, contents){
		if (_.isUndefined(layout)) {
			callback(error, contents);
		} else {
			fileContext.contents = contents;
			render(layout, fileContext, callback);
		}
	}

	try {
		render(contentPath, fileContext, processResult);
	} catch(error){
		callback(error);
	}
}

//Processes a source file from the grunt task
function processSourceFile(filepath, next){
	grunt.log.ok("Processing " + filepath + "\n");
	//Renders then writes the file
	generateFile(filepath, function(err, contents){
		if (err) {
			grunt.warn(err);
			next(err);
		}
		writeFile(contents, getHtmlFileDestination(filepath));
		next();
	});
}

//Makes the site context available to the functions in this module
function getSiteContext(filepath){
	grunt.log.debug(filepath);
	try {
		siteContext = grunt.file.readJSON(filepath);
	} catch(error){
		return {};
	}
}

//Knows how to deconstruct the grunt config
//and trigger the process for each source file to produce the html files
function generateHtmlFiles(task, done){
	//Deconstruct the grunt task
	var filepaths = util.expandFiles(task.file.src);
	taskOptions = task.options();
	destination = task.file.dest;
	useNearestContext = taskOptions.useNearestContext || false;

	//Fetch the site context
	getSiteContext(taskOptions.context);

	//Process all of the files in the task
  grunt.util.async.forEachSeries(filepaths, 
		processSourceFile, 
		function(){
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}

exports.generateHtmlFiles = generateHtmlFiles;