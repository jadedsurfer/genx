/*
* grunt-genx helpers
* https://github.com/tbashor/grunt-genx
*
* Copyright (c) 2012 Todd Bashor
* Licensed under the MIT license.
*/

//"use strict";

var grunt = require('grunt'), 
		fs = require('fs'),
		p = require('path'),
		_ = grunt.util._, 
		extend = require('node.extend'),
		util = require('./util');

grunt.file.defaultEncoding = 'utf8'

var siteContext = {
			files:{},
			directories:{}
		};

function generateSite(src, options, done){
	//handle grunt configuration
	grunt.util.async.forEachSeries(
		src, 
		function processFile(root, next) {
			walkSite(root, processItem, next);
		}, 
		function(err){
			if (err) {
				grunt.log.error('something went wrong');
				grunt.log.error(err);
			}
			grunt.log.ok('done processing files');
			mergeContexts(options);
			grunt.file.write(options.dest, JSON.stringify(siteContext));
			grunt.log.ok('ALL DONE'); 
			done();
		} 
	);
}

function walkSite(dir, action, done){
	//start at root and walk down
	//test for directory or file
	//addfile or adddirectory
	/**
	 * dir: path to the directory to explore
	 * action(file, stat): called on each file or until an error occurs. file: path to the file. stat: stat of the file (retrived by fs.stat)
	 * done(err): called one time when the process is complete. err is undifined is everything was ok. the error that stopped the process otherwise
	 */

	// this flag will indicate if an error occured (in this case we don't want to go on walking the tree)
	var dead = false;

	// this flag will store the number of pending async operations
	var pending = 0;

	var fail = function(err) {
		if(!dead) {
			dead = true;
			done(err);
		}
	};

	var checkSuccess = function() {
		if(!dead && pending == 0) {
			done();
		}
	};

	var performAction = function(file, stat, parent) {
			if(!dead) {
					try {
							action(file, stat, parent);
					}
					catch(error) {
							fail(error);
					}
			}
	};

	// this function will recursively explore one directory in the context defined by the variables above
	var dive = function(dir) {
			pending++; // async operation starting after this line
			fs.readdir(dir, function(err, list) {
				if(!dead) { // if we are already dead, we don't do anything
					if (err) {
						fail(err); // if an error occured, let's fail
					}
					else { // iterate over the files
						list.forEach(function(file) {
							if(!dead) { // if we are already dead, we don't do anything
								var path = p.join(dir, file);
								pending++; // async operation starting after this line
								fs.stat(path, function(err, stat) {
									if(!dead) { // if we are already dead, we don't do anything
										if (err) {
											fail(err); // if an error occured, let's fail
										}
										else {
											performAction(file, stat, dir);
											if (stat && stat.isDirectory()) {
												dive(path); // it's a directory, let's explore recursively
											}
											pending--; checkSuccess(); // async operation complete
										}
									}
								});
							}
						});
					pending--; checkSuccess(); // async operation complete
				}
			}
		});
	};

	// start exploration
	dive(dir);
};

function processItem(name, stat, parent){
	grunt.log.ok('processing ' + util.createPath(parent, name));
	if (stat.isDirectory()){
		//grunt.log.ok('got directory: '+ name);
		addDirectory(name, parent);
	} else if(stat.isFile() && name.charAt(0) != ".") {
		if (p.extname(name) == '.json') {
			//grunt.log.ok('got file: ' + name);
			addContextFile(name, parent);
			} else  {
			//grunt.log.ok('got file: ' + name);
			addFile(name, parent);
		}
	}
}

function addDirectory(name, parent){
	//add directory key to directory
	var path = util.createPath(parent, name),
			context = {};
	if (_.isUndefined(siteContext.directories[path])) {
		siteContext.directories[path] = {
			files: [],
			context: {}
		};
	}
}

function addContextFile(name, parent){
	//add file key and contents to siteContext._files
	//addFileToDirectory
	var path = util.createPath(parent, name),
			dirs = util.getDirectories(path);
	//grunt.log.ok(JSON.stringify(grunt.file.readJSON(path)));
	siteContext.files[path] = {
		contents: grunt.file.readJSON(path)
	};
	addDirectory(dirs[dirs.length-1],p.dirname(parent));
	siteContext.directories[parent].files.push(path);
}

function addFile(name, parent){
	//add file key and contents to siteContext._files
	//addFileToDirectory
	var path = util.createPath(parent, name),
			dirs = util.getDirectories(path);
	siteContext.files[path] = {
		contents: ""
	};
	addDirectory(dirs[dirs.length-1],p.dirname(parent));
	siteContext.directories[parent].files.push(path);
}

function mergeContexts(options){
	//loop through _files
	//for each get the context for each parent directory starting at the root
	//merge the directory contexts with file's context
	options = options || {};
	for (file in siteContext.files){
		if (p.extname(file) == '.json') {
	  	var dirs = util.getDirectories(file),
	  			i = 0,
	  			dir = '',
	  			previousContext = {},
	  			dirContext = {},
	  			fileContext = siteContext.files[file].contents,
	  			parentDirectory = '',
	  			currentDir = '',
	  			path = '';
	  	for(;i<dirs.length;i++){
	  		currentDir = dirs[i];
	  		path = util.createPath(parentDirectory, currentDir);
	  		addDirectory(currentDir, parentDirectory);
	  		dirContext = siteContext.directories[path].context = extend(true, options, getDirectoryContext(path));
	  		previousContext = extend(true, previousContext, dirContext);
	  		parentDirectory = util.createPath(parentDirectory, currentDir);
	  	}
	  	siteContext.files[file].contents = extend(true, previousContext, fileContext);
	  }
  }
}

function getDirectoryContext(key){
	var filename = util.getFileName(key);
	try {
		return siteContext.files[key + '/' + filename + '.json'].contents;
	} catch(error) {
		return {}
	}
}


exports.generateSite = generateSite;