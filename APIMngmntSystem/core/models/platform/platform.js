/// <reference path="" />
//var schema = require("../../common/schema.js");
var utility = require('../../common/utility.js');
var store = require('../../common/store.js');

var schemafunctions = require('../schema/schema.js');
var nodeHeader = require('../header/nodeHeader.js');
var clientHeader = require('../header/clientHeader.js');

var extend = require('extend');
var baseFunctions = {
	setKey: function () {
		this.key = utility.guid();
		//this.res.cookie("authToken", this.key);
	},
	getKey: function () {
		return this.key || this.client.getSessionKey();
	},
	loadKey: function (sessionKey) {
		this.key = sessionKey || this.client.getSessionKey();
		return baseFunctions.getKey();
	},
	setSubjectID: function (subjectID) {
		this._subjectID = subjectID;
	},
	getSubjectID: function () {
		return this._subjectID;
	},
	//saveInStore: function () {
	//	store.save(this.getKey(), JSON.stringify(this));
	//},
	set: function (value, namespace) {
		if (namespace) {			
			this[namespace] = Object.assign(this[namespace] || {}, value);
		}
		else {
			var self = this;
			self = Object.assign(self, value);			
		}
	},
	get: function (key, namespace) {
		var returnObject;
		if (namespace) {
			returnObject = this[namespace];
		}
		else {
			returnObject = this;
		}
		if (key) {
			return returnObject[key];
		}
		else {
			return returnObject;
		}
	},
	
	
	getCommand: function () {

	},
	setCommand: function () { },
	setPlatformCommands: function (commandsList) {
		this.platformCommands = commandsList;
	},
	getCurrentPlatformCommand: function () {
		if (this.platformCommands) {
			return this.platformCommands.shift();
		}
		else {
			return null;
		}
	},
	getPlatformComponentName: function () {
		var header = this.getRequestHeader();
		if (header) {
			return header.applicationName;
		}
		else {
			return null;
		}
	},
	getApplicationAPIName: function () {
		var methodName = this.getAPIName();
		return schema.getApplicationAPIName(methodName);
	},
	
	setRequestID: function (ClientRequestID) {
		this.ClientRequestID = ClientRequestID;
	},
	getRequestID: function () {
		return this.ClientRequestID;
	},
	getNestingLevel: function () {
		return this._nestingLevel;
	},
	incrementNestingLevel: function () {
		this._nestingLevel = this._nestingLevel || 0;
		this._nestingLevel++;
		return this._nestingLevel;
	},
	decrementNestingLevel: function () {
		this._nestingLevel = this._nestingLevel || 0;
		this._nestingLevel--;
		return this._nestingLevel;
	},
	resolveInParams: function (params) {
		var s = this.getSchemaObject();
		s.get
	}
};


var base = {
	create: function () {
		var model = {};

		extend(true, model, baseFunctions);

		model.schema = {};
		extend(true, model.schema, schemafunctions(model));

		model.node = {};
		extend(true, model.node, nodeHeader(model));

		model.client = {};
		extend(true, model.client, clientHeader(model));
		return model;
	}
}

base.create.baseFunctions = baseFunctions;
base.create.load = function (key) {
	var storeObject = store.fetch(key);
	if (storeObject) {
		var st_ = JSON.parse(storeObject);
		st_ = extend(true, st_, baseFunctions);
		return _st;
	}
	else {
		return null;
	}
}
var Class = {
	cons: function () {
		return base.create;
	}
}
module.exports = Class.cons();