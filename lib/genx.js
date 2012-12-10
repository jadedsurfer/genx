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
		fs = require('fs'), 
		_ = grunt.util._, 
		path = require('path'), 
		extensions = require('./engines'),
		extend = require('node.extend');

grunt.file.defaultEncoding = 'utf8'

//Uses the grunt configuration to generate html files
function generateHtmlFiles(src, options, done){
	var filepaths = expandFiles(src);

	grunt.util.async.forEachSeries(
		filepaths, 
		function processSource(filepath, next) {
			generateFile(filepath, options, function(err){
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

// Creates an array of filepaths
function expandFiles(src){
	var filepaths = [];

	grunt.file.expandFiles(src).forEach(function(filepath){
		filepaths.push(filepath);
	});

	return filepaths;
}

//Renders and writes a html file to a destination directory
function generateFile(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");
	
	var engine = getEngineOf(filename), 
			name = getFileName(contentPath), 
			contextPath = path.join(srcPath, name + '.json'),
			destPath = path.join(options.dest, name + '.html'), 
			context = getContext(contextPath, options),
			layout = context.layout;

	function writeFile(contents) {
		grunt.file.write(destPath, contents);
		callback();
	}

	function renderLayout(contents) {
		context.contents = contents;
		render(getEngineOf(layout), layout, context, writeFile);
	}

	if (layout == undefined) {
		render(engine, contentPath, context, writeFile);
	} else {
		render(engine, contentPath, context, renderLayout);
	}
}

//Maps the file extension to a rendering engine
function getEngineOf(fileName) {
	var extension = _(fileName.match(/[^.]*$/)).last();
	return _(_(extensions).keys()).include(extension) ? extensions[extension] : false;
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

//Renders the file using the specified engine
function render(engine, filepath, context, callback) {
	grunt.log.debug("Rendering " + filepath + "\n");
	cons[engine](filepath, context, function(err, html) {
		if (err)
			throw err
		callback(html);
	});
}

//Returns the file name without the extension
function getFileName(filepath){
	return path.basename(filepath, path.extname(filepath));
}

//Returns an array of the directories leading to a file
function getDirectories(filepath){
	return path.dirname(filepath).split(path.sep);
}

//Returns the immediate parent directory of a file
function getParentDirectory(filepath){
	var pathParts = getDirectories(filepath);
	return pathParts[pathParts.length-1];
}

//Uses the grunt configuration to generate json files
function generateSiteContext(src, options, done){
	var filepaths = expandFiles(src),
			//Need to maintain this because of a problem with deep extend and array merging
			fileContextsByDirectory = {};

	grunt.util.async.forEachSeries(
		filepaths, 
		function processFile(filepath, next) {
			var currentDirectory = getParentDirectory(filepath);

			//Initialize the array for a directory that hasn't been seen before
			if (!_.isArray(fileContextsByDirectory[currentDirectory])) {
				fileContextsByDirectory[currentDirectory] = [];
			}

			//Build directory and file contexts
			getFileContext(filepath, options, function(err, directoryContext, fileContext){
				//Add file context to file context tracking object
				if ( (getFileName(filepath) != currentDirectory) && fileContext ) {
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

//Renders and write a file to a destination directory
function getFileContext(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");

	var fileContext = grunt.file.readJSON(contentPath),
			name = getFileName(contentPath);
			startingContext = {_files:[]},
			directoryContext = {};

	if (name !== getParentDirectory(contentPath)){
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
	var pathParts = getDirectories(contentPath),
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


exports.generateHtmlFiles = generateHtmlFiles;
exports.generateFile = generateFile;
exports.generateJsonFiles = generateSiteContext;