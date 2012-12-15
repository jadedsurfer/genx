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
		path = require('path'), 
		extensions = require('./engines');

// Creates an array of filepaths
function expandFiles(src){
	var filepaths = [];

	grunt.file.expandFiles(src).forEach(function(filepath){
		filepaths.push(filepath);
	});

	return filepaths;
}

//Maps the file extension to a rendering engine
function getEngineOf(fileName) {
	var extension = _(fileName.match(/[^.]*$/)).last();
	return _(_(extensions).keys()).include(extension) ? extensions[extension] : false;
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

function getDirectoryPath(filepath){
	return path.dirname(filepath);
}

function createPath(parent, name){
	return path.join(parent, name);
}

exports.expandFiles = expandFiles;
exports.getEngineOf = getEngineOf;
exports.getFileName = getFileName;
exports.getDirectories = getDirectories;
exports.getParentDirectory = getParentDirectory,
exports.getDirectoryPath = getDirectoryPath,
exports.createPath = createPath;