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
		fs = require('fs'), 
		_ = grunt.util._, 
		path = require('path'),
		extensions = {
			"dust" : "dust",
			"eco" : "eco",
			"ejs" : "ejs",
			"haml" : "haml",
			"haml-coffee" : "haml-coffee",
			"handlebars" : "handlebars",
			"hbt" : "handlebars",
			"hb" : "handlebars",
			"handlebar" : "handlebars",
			"hogan" : "hogan",
			"jade" : "jade",
			"jt" : "jade",
			"jazz" : "jazz",
			"jqtpl" : "jqtpl",
			"jst" : "underscore",
			"liquor" : "liquor",
			"mustache" : "mustache",
			"QEJS" : "QEJS",
			"swig" : "swig",
			"underscore" : "underscore",
			"us" : "underscore",
			"walrus" : "walrus",
			"whiskers" : "whiskers"
		};
			
exports.getEngineOf = function(fileName) {
	var extension = _(fileName.match(/[^.]*$/)).last();
	return _(_(extensions).keys()).include(extension) ? extensions[extension] : false;
}

exports.generateFile = function(filepath, destDir, options, callback) {
	var template = grunt.file.read(filepath),
			filename = path.basename(filepath, path.extname(filepath)),//source file name without extension
			srcPath = path.dirname(filepath),//source directory
			contextPath = path.join(srcPath, filename + '.json'),//path to json file with context
			destPath = path.join(destDir, filename + '.html'),//path to destination file
			context = grunt.file.read(contextPath);//contents of context file
			console.log(context);
	grunt.file.write(destPath, template);
	callback();
}

exports.getDestinationPath = function(src, destDir, options, extension) {
		if (destDir && options.preserve_dirs) {
			var dirname = path.dirname(src);
			if (options.base_path) {
				dirname = dirname.replace(new RegExp('^' + options.base_path), '');
			}
			destDir = path.join(destDir, dirname);
		} else if (!destDir) {
			destDir = path.dirname(src);
		}
		//return grunt.helper('createDestinationPath', src, destDir, extension);
	}

exports.createDestinationPath = function(src, destDir, newExtension) {
		var srcFileName = path.basename(src), 
		srcExtension = path.extname(srcFileName), 
		destFileName = path.basename(src, srcExtension);
		return path.join(destDir, destFileName + newExtension);
	}


exports.renderFiles = function(sourceFiles, destDir, options, extension, data, done) {
		// iterator for each source file
		function processFile(sourceFilePath, callback) {
			//grunt.log.writeln("Processing file from '" + sourceFilePath + "'");
			var engine = options.engine || getEngineOf(sourceFilePath);
			if (!engine) {
				grunt.log.writeln("No compatable engine available");
				callback(false);
				return false;
			}
			var target = grunt.helper('getDestinationPath', sourceFilePath, destDir, options, extension);
			//grunt.helper('renderFile', engine, sourceFilePath, data, target, callback);
		}

		// callback when all files are processed
		function finished(err) {
			if (err) {
				grunt.log.error(err);
				done(false);
				return false;
			}
			grunt.log.writeln("All files written to '" + destDir + "'");
			done(true);
		}

		// Loop through each file, render it to the target, then call done
		utils.async.forEach(sourceFiles, processFile, finished);
	}

exports.renderFile = function(engine, sourceFilePath, data, target, callback) {
		cons[engine](sourceFilePath, data, function(err, result) {
			if (err) {
				grunt.log.error(err);
				callback(err);
			}
			grunt.file.write(target, result);
			//grunt.log.writeln("File written to '" + target + "'");
			callback();
		});
	}

	

