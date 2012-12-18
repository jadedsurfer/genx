/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

"use strict";

var grunt = require('grunt'), 
		fs = require('fs'),
		p = require('path'),
		_ = grunt.util._, 
		extend = require('node.extend'),
		util = require('./util');

grunt.file.defaultEncoding = 'utf8';

var siteContext = {
			files:{},
			directories:{}
		};

//Extends a json file object in siteContext with its contents 
function addContextFile(filePath, contents, context){
	if (p.extname(filePath) === '.json') {
		context.files[filePath] = extend(true, context.files[filePath], {contents: contents, context: {}});
	}
}

//Grabs the contents of the file and triggers each plugin from grunt config
function runDuringWalkPlugins(filePath){
	var contents;
	//Plugins will not process dot files
	if (util.getFileName(filePath).charAt(0) !== ".") {
		if (p.extname(filePath) === '.json') {
			//Read the file contents so each plugin doesn't have to
			contents = grunt.file.readJSON(filePath);
		} else {
			contents = grunt.file.read(filePath);
		}
		//Process duringWalk plugins
		addContextFile(filePath, contents, siteContext);
	}
}

//Adds directory key to directories object if it doesn't exist
function addDirectory(directoryPath){
	var context = {};
	if (_.isUndefined(siteContext.directories[directoryPath])) {
		siteContext.directories[directoryPath] = {
			files: [],
			context: {}
		};
	}
}

//Sets up siteContext for each file and triggers plugins
function processItem(filePath, rootPath, parentPath, filename){
	grunt.log.ok('Processing ' + filePath);
	var parentDirectory = util.createPath(rootPath, parentPath);
	//Make sure the directory is in the siteContext
	addDirectory(parentDirectory);
	//Add the file to the parent's file array
	if (util.getFileName(filePath).charAt(0) !== ".") {
		siteContext.directories[parentDirectory].files.push(filePath);
		//Add file to siteContext files array
		siteContext.files[filePath] = {context:{}};
		//Handle the plugins
		runDuringWalkPlugins(filePath);
	}
}

//Returns the contents of the context file related to the directory
function getDirectoryContext(key){
	var filename = util.getFileName(key),
			context = {};
	try {
		context = siteContext.files[key + '/' + filename + '.json'].contents;
		//grunt.log.ok('found dir context: ' + JSON.stringify(context));
		return context;
	} catch (error) {
		//grunt.log.ok('no context file');
		return context;
	}
	
}

//Assigns the unified context of a context file to the file's context
function setFileContext(filePath, context){
	//grunt.log.ok('SETTING file context for ' + filePath );
	var fileContext = siteContext.files[filePath].contents,
			dirs = util.getDirectories(filePath),
			i = 0,
			previousContext = {},
			dirContext = {},
			dir, parentDirectory, currentDir, path;
		//Build up context from higher directories
		for(;i<dirs.length;i++){
			currentDir = dirs[i];
			parentDirectory = path = util.createPath(parentDirectory, currentDir);
			//Make sure directory has been added
			addDirectory(path);
			//grunt.log.ok('setting context for: ' + path);
			//grunt.log.ok('context: ' + JSON.stringify(context));
			dirContext = siteContext.directories[path].context = extend(true, {}, context, getDirectoryContext(path));
			//grunt.log.ok('set directory context: ' + JSON.stringify(dirContext));
			previousContext = extend(true, previousContext, dirContext);
		}
		//grunt.log.ok('set file context: ' + JSON.stringify(previousContext));
		siteContext.files[filePath].context = extend(true, previousContext, fileContext);
}

//Merges the directory context with the file context
//TODO: set the context on the non-json files instead
function mergeContexts(context){
	grunt.log.ok('merging contexts');
	//loop through _files
	//for each get the context for each parent directory starting at the root
	//merge the directory contexts with file's context
	var cntxt = context || {},
			file = '';
	for (file in siteContext.files){
		//grunt.log.ok(file);
		if (p.extname(file) === '.json') {
			setFileContext(file, cntxt);
		}
	}
}

//Runs each of the post walk plugins specified in the grunt config
function runPostWalkPlugins(options){
	var cntxt = options.context || {};
	mergeContexts(cntxt);
}


function generateManifest(root, taskOptions, destination, done){
	grunt.log.debug("Processing root: " + root + "\n");
	grunt.file.recurse(root, processItem);
	//grunt.log.ok(JSON.stringify(siteContext.directories));
	grunt.log.ok('done processing files');

	runPostWalkPlugins(taskOptions);

	grunt.log.ok('saving manifest to destination');
	grunt.file.write(destination, JSON.stringify(siteContext));

	grunt.log.ok('ALL DONE'); 
	done();
}

//Knows how to deconstruct the grunt config
//and triggers the site context construction
function generate(task, done){
	//Deconstruct the grunt task
	var root = task.file.root,
			taskOptions = task.options() || {},
			destination = task.file.dest || root;

	generateManifest(root, taskOptions, destination, done);
}

exports.generate = generate;
exports.generateManifest = generateManifest;