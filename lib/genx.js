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

//function processFiles(filespaths, )
//Loops through each file referenced in the grunt config
function generateHtmlFiles(src, options, done){
	var filepaths = expandFiles(src);
	grunt.util.async.forEachSeries(filepaths, function processSource(filepath, next) {
		generateFile(filepath, options, function(err){
			if (err) {
				grunt.warn(err);
				next(err);
			}
			next();
		});
	}, function(){
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}

// Creates an array
function expandFiles(src){
	var filepaths = [];
	grunt.file.expandFiles(src).forEach(function(filepath){
		filepaths.push(filepath);
	});

	return filepaths;
}

//Renders and write a file to a destination directory
function generateFile(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");
	
	//var extension = , //just the extension
	var filename = path.basename(contentPath), //source file name with extension
			srcPath = path.dirname(contentPath), //source directory
			engine = getEngineOf(filename), 
			name = path.basename(filename, path.extname(contentPath)), 
			contextPath = path.join(srcPath, name + '.json'), //path to json file with context
			destPath = path.join(options.dest, name + '.html'), //path to destination file
			context = getContext(contextPath, options), //contents of context file
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



//Expands the files from the grunt configuration
//Loops through them to build up the site's context file
//Write
function generateJsonFiles(src, options, done){
	//maintain an array of directories
	//for each directory append the file contexts 

	var filepaths = expandFiles(src),
			dirs = {};

	grunt.util.async.forEachSeries(filepaths, function processSource(filepath, next) {
		//var pathParts = path.dirname(filepath).split(path.sep),
		//getObjectToMerge(filepath)
		console.log(filepath);

		//Setup global file array object
		var pathParts = path.dirname(filepath).split(path.sep),
				dir = pathParts[pathParts.length-1],
				name = path.basename(filepath, path.extname(filepath));
		if (!_.isArray(dirs[dir])) {
			dirs[dir] = [];
		}
		generateJSON(filepath, options, function(err, dirContext, fileContext){
			if (name != dir) {
				dirs[dir].push(fileContext);
			};
			extend(true, options, dirContext);
			if (err) {
				grunt.warn(err);
				next(err);
			}
			next();
		});
	}, function(){
			//console.log(dirs);
			//go through the dirs object and put the arrays on the proper object
			//options.content.blog.posts._files = dirs.posts;
			//options.content.blog.another._files = dirs.another;
			//options.content.blog.another.yetanother._files = dirs.yetanother;
			options = mergeContextWithArray(options, dirs);
			//TODO: create function to append dirs object to options object and get rid of line above
			grunt.file.write(options.dest, JSON.stringify(options));
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}
//Renders and write a file to a destination directory
function generateJSON(contentPath, options, callback) {
	grunt.log.ok(">>Processing " + contentPath + "\n");

	var filename = path.basename(contentPath), //source file name with extension
			extension = path.extname(contentPath), //just the extension
			name = path.basename(filename, extension), // source file name without extension
			context = grunt.file.readJSON(contentPath),//contents of context file
			pathParts = path.dirname(contentPath).split(path.sep),
			dir = pathParts[pathParts.length-1],
			startingContext = {},
			dirContext = {};

	startingContext._files = [];
	if (name !== dir){
		//Add the file name to the context object
		context._file = name;
	} else {
		//This will start the directory context
		startingContext = context;
	};
	
	dirContext = startingContext;

	callback(null, generateDirectoryContext(contentPath, dirContext), context);
	
}

function generateDirectoryContext(contentPath, dirContext){
	var pathParts = path.dirname(contentPath).split(path.sep),
			dir = pathParts[pathParts.length-1],
			startingContext={},
			i=pathParts.length-1,
			key = '';

	//work back to the startingContext directory
	for (i;i>0;i--){
		//reset startingContext for each loop
		startingContext = {};
		key = pathParts[i];
		//console.log(key);
		startingContext[key] = dirContext;
		dirContext = startingContext;
	}

	return dirContext;
}

function eachRecursive(obj, previousKey, fileContexts){
	    for (var k in obj){
	    		if (k == "_files"){
	    			grunt.log.ok('previous ' + previousKey);
	    			//TODO: Support parallel directory structure in the fileContexts
	    			obj._files = fileContexts[previousKey];
	    		} else {
						if (typeof obj[k] == "object") {
		            eachRecursive(obj[k], k, fileContexts);
		        } else {
		            // do something... 
		        }
	    		}
	        
	    }
	    return obj;
	}

function mergeContextWithArray(dirContext, fileContexts){
	return eachRecursive(dirContext, '', fileContexts);
}



exports.generateHtmlFiles = generateHtmlFiles;
exports.generateFile = generateFile;
exports.generateJsonFiles = generateJsonFiles;
exports.generateJSON = generateJSON;
/*
	grunt.file.recurse(startingContextdir, function callback(abspath, startingContextdir, subdir, filename) {
		// The full path to the current file, which is nothing more than
		// the startingContextdir + subdir + filename arguments, joined.
		abspath
		// The startingContext director, as originally specified.
		startingContextdir
		// The current file's directory, relative to startingContextdir.
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

