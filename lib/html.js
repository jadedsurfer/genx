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

	siteContext = grunt.file.readJSON(options.context) || {};
  grunt.util.async.forEachSeries(
		filepaths, 
		function processSource(filepath, next) {
			generateFile(filepath, dest, function(err){
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

function getContext(contentPath){
	//var contextPath = path.join
}

//Renders and writes a html file to a destination directory
function generateFile(contentPath, destinationDir, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");

	var engine = util.getEngineOf(contentPath), 
			name = util.getFileName(contentPath), 
			contextPath = path.join(util.getDirectoryPath(contentPath), name + '.json'),
			destPath = path.join(destinationDir, name + '.html'), 
			//context = cntx.getContext(contextPath, options),
			context = {},
			layout = '';

	function writeFile(contents) {
		grunt.file.write(destPath, contents);
		callback();
	}

	function renderLayout(contents) {
		context.contents = contents;

		render(util.getEngineOf(layout), layout, context, writeFile);
	}

	try {
		if (!_.isUndefined(siteContext.files[contextPath])) {
			//TODO: need a getContext function that will try to find the nearest matching context up the tree
			//make this matching optional in the grunt config
			context = siteContext.files[contextPath].contents;
			grunt.log.ok(JSON.stringify(context));
			layout = context.layout;
		}
		if (layout == undefined) {
			render(engine, contentPath, context, writeFile);
		} else {
			render(engine, contentPath, context, renderLayout);
		}
	} catch(error){
		grunt.log.error(error);
		return
	} finally {
		
		
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