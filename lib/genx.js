/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

//"use strict";

var grunt = require('grunt'), cons = require('consolidate-build'), fs = require('fs'), _ = grunt.util._, path = require('path'), extensions = require('./engines');

grunt.file.defaultEncoding = 'utf8'

function getEngineOf(fileName) {
	var extension = _(fileName.match(/[^.]*$/)).last();
	return _(_(extensions).keys()).include(extension) ? extensions[extension] : false;
}

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

function render(engine, filepath, context, callback) {
	grunt.log.debug("Rendering " + filepath + "\n");
	cons[engine](filepath, context, function(err, html) {
		if (err)
			throw err
		callback(html);
	});
}

//Renders and write a file to a destination directory
exports.generateFile = function generateFile(contentPath, destDir, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");
	var extension = path.extname(contentPath), //just the extension
	filename = path.basename(contentPath), //source file name without extension
	srcPath = path.dirname(contentPath), //source directory
	engine = getEngineOf(filename), name = path.basename(filename, extension), contextPath = path.join(srcPath, name + '.json'), //path to json file with context
	destPath = path.join(destDir, name + '.html'), //path to destination file
	context = getContext(contextPath, options), //contents of context file
	layout = context.layout;

	//delete context.layout;

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
/*
function dirTree(filename) {
	var stats = fs.lstatSync(filename), 
			info = {
				path : filename,
				name : path.basename(filename)
			};

	if (stats.isDirectory()) {
		info.type = "folder";
		info.children = fs.readdirSync(filename).map(function(child) {
			return dirTree(filename + '/' + child);
		});
	} else {
		// Assuming it's a file. In real life it could be a symlink or
		// something else!
		info.type = "file";
	}

	return info;
}

if (module.parent == undefined) {
	// node dirTree.js ~/foo/bar
	var util = require('util');
	console.log(util.inspect(dirTree(process.argv[2]), false, null));
}
*/

//Renders and write a file to a destination directory
exports.generateJSON = function generateFile(contentPath, dest, options, siteContext, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");
	var extension = path.extname(contentPath), //just the extension
			filename = path.basename(contentPath), //source file name without extension
			srcPath = path.dirname(contentPath), //source directory
			engine = getEngineOf(filename), 
			name = path.basename(filename, extension), 
			context = grunt.file.readJSON(contentPath),//contents of context file
			pathParts = contentPath.split(path.sep);
	//console.log(siteContext);
	//console.log(siteContext);
	var objToAppend = context;
	var root = {};
	for (var i=pathParts.length-1;i>0;i--){
		root ={};
		var key = pathParts[i],
				basename = path.basename(key, ".json");
				console.log(key);
		if (path.extname(key)=='.json' && basename == pathParts[i-1]){
		} else {
			root[key] = objToAppend;
			objToAppend = root;
		}
			
	}

	//_.extend(siteContext, objToAppend);
	//console.log(siteContext);
	callback(null, objToAppend);
	

/*
	grunt.file.recurse(rootdir, function callback(abspath, rootdir, subdir, filename) {
		// The full path to the current file, which is nothing more than
		// the rootdir + subdir + filename arguments, joined.
		abspath
		// The root director, as originally specified.
		rootdir
		// The current file's directory, relative to rootdir.
		subdir
		// The filename of the current file, without any directory parts.
		filename
	})
*/
	/*
	 //delete context.layout;

	 function writeFile(contents){
	 grunt.file.write(destPath, contents);
	 callback();
	 }

	 function renderLayout(contents){
	 context.contents = contents;
	 render(getEngineOf(layout), layout, context, writeFile);
	 }

	 if (layout == undefined){
	 render(engine, contentPath, context, writeFile);
	 } else {
	 render(engine, contentPath, context, renderLayout);
	 }
	 */
}
/*
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
 */

