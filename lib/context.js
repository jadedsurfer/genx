/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

//"use strict";

var grunt = require('grunt'), 
		_ = grunt.util._, 
		extend = require('node.extend'),
		util = require('./util');

grunt.file.defaultEncoding = 'utf8'

//Uses the grunt configuration to generate json files
function generateSiteContext(src, options, done){
	var filepaths = util.expandFiles(src),
			//Need to maintain this because of a problem with deep extend and array merging
			fileContextsByDirectory = {};

	grunt.util.async.forEachSeries(
		filepaths, 
		function processFile(filepath, next) {
			processFileContext(filepath, fileContextsByDirectory, options, next);
		}, 
		function(){
			//Finalize overall site context by merging file context tracking object
			options = mergeDirectoryAndFileContexts(options, fileContextsByDirectory);
			//TODO: create function to append fileContextsByDirectory object to options object and get rid of line above
			grunt.file.write(options.dest, JSON.stringify(options));
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}

//Add to directory and file context tracking objects
function processFileContext(filepath, fileContextsByDirectory, options, next){
	var currentDirectory = util.getParentDirectory(filepath);

	//Initialize the array for a directory that hasn't been seen before
	if (!_.isArray(fileContextsByDirectory[currentDirectory])) {
		fileContextsByDirectory[currentDirectory] = [];
	}

	//Build directory and file contexts
	getFileContext(filepath, options, function(err, directoryContext, fileContext){
		//Add file context to file context tracking object
		if ( (util.getFileName(filepath) != currentDirectory) && fileContext ) {
			fileContextsByDirectory[currentDirectory].push(fileContext);
		};
		//Add directory context to site context
		extend(true, options, directoryContext);
		if (err) {
			grunt.warn(err);
			next(err);
		}
		next();
	});
}

//Renders and write a file to a destination directory
function getFileContext(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");

	var fileContext = grunt.file.readJSON(contentPath),
			name = util.getFileName(contentPath);
			startingContext = {_files:[]},
			directoryContext = {};

	if (name !== util.getParentDirectory(contentPath)){
		//Add the file name to the context object
		fileContext._file = name;
	} else {
		startingContext = fileContext;
	};
	
	directoryContext = startingContext;

	callback(null, generateDirectoryContext(contentPath, directoryContext), fileContext);
}

//Wraps a context object inside a directory tree
function generateDirectoryContext(contentPath, directoryContext){
	var pathParts = util.getDirectories(contentPath),
			startingContext={},
			i=pathParts.length-1,
			directoryName = '';

	//Build up a directory tree in json object
	//starting from the file's parent directory
	for (;i>0;i--){
		startingContext = {};
		directoryName = pathParts[i];
		startingContext[directoryName] = directoryContext;
		directoryContext = startingContext;
	}

	return directoryContext;
}

function mergeDirectoryAndFileContexts(directoryContext, fileContexts, previousKey){
	var currentKey;
  for (currentKey in directoryContext){
  	//_files is the property we want to set
		if (currentKey == "_files"){
			//TODO: Support parallel directory structure in the fileContexts
			directoryContext._files = fileContexts[previousKey];
		} 
  	//if it hits an object go deeper
		else {
			if (typeof directoryContext[currentKey] == "object") {
          mergeDirectoryAndFileContexts(directoryContext[currentKey], fileContexts, currentKey);
      } 
		}
  }
  return directoryContext;
}

//Combines the contents of a context file with the passed options
function getContext(contextPath, options) {
	try {
		var context = _.extend({}, options);

		_.extend(context, grunt.file.readJSON(contextPath));

		return context;

	} catch(e) {
		if (e.origError.code == 'ENOENT') {
			grunt.log.warn('File "' + contextPath + '"' + " doesn't exist.");
		} else {
			grunt.log.error('Problem with "' + contextPath + '" file (' + e.message + ').', e);
		}

		return context;
	}
}


exports.generateSiteContext = generateSiteContext,
exports.getContext = getContext;