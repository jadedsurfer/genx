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
			
module.exports.getEngineOf = function(fileName) {
	var extension = _(fileName.match(/[^.]*$/)).last();
	return _(_(extensions).keys()).include(extension) ? extensions[extension] : false;
}

module.exports.generateFile = function(filepath, dest, callback) {
	var template = grunt.file.read(filepath);
	grunt.file.write(dest, template);
	callback();
}
