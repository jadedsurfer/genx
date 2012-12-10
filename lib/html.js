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
		util = require('./util'),
		cntx = require('./context');

grunt.file.defaultEncoding = 'utf8'

//Uses the grunt configuration to generate html files
function generateHtmlFiles(src, options, done){
	var filepaths = util.expandFiles(src);

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

//Renders and writes a html file to a destination directory
function generateFile(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");

	var engine = util.getEngineOf(contentPath), 
			name = util.getFileName(contentPath), 
			contextPath = path.join(util.getDirectoryPath(contentPath), name + '.json'),
			destPath = path.join(options.dest, name + '.html'), 
			context = cntx.getContext(contextPath, options),
			layout = context.layout;

	function writeFile(contents) {
		grunt.file.write(destPath, contents);
		callback();
	}

	function renderLayout(contents) {
		context.contents = contents;
		render(util.getEngineOf(layout), layout, context, writeFile);
	}

	if (layout == undefined) {
		render(engine, contentPath, context, writeFile);
	} else {
		render(engine, contentPath, context, renderLayout);
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