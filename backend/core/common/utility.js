var store =require('./store.js');
var Def = require("jquery-deferred");
//var schema = require('./schema.js');
var extend = require('extend');
var processor = require("../processors/processors.js");
var Y = require('yyield');
var utility = {
	prevTimeId: 0,
	prevUniqueId: 0,
	crcTable: null,
	getUniqueID: function () {
		try {
			var d = new Date();
			var newUniqueId = d.getTime();
			if (newUniqueId == this.prevTimeId)
				this.prevUniqueId = this.prevUniqueId + 1;
			else {
				this.prevTimeId = newUniqueId;
				this.prevUniqueId = 0;
			}
			newUniqueId = newUniqueId + '' + this.prevUniqueId;
			return newUniqueId;
		}
		catch (e) {
			console.log('Unique.getUniqueID error:' + e.message + '.');
		}
	},
	s4:function () {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	},
	guid : function() {		
		return utility.s4() + utility.s4() + '-' + utility.s4() + '-' + utility.s4() + '-' +
		  utility.s4() + '-' + utility.s4() + utility.s4() + utility.s4();
	},
	makeCRCTable: function () {
		var c;
		var crcTable = [];
		for (var n = 0; n < 256; n++) {
			c = n;
			for (var k = 0; k < 8; k++) {
				c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			crcTable[n] = c;
		}
		this.crcTable = crcTable;
		return crcTable;
	},
	crc32: function (str) {
		var crcTable = this.crcTable || (this.crcTable = this.makeCRCTable());
		var crc = 0 ^ (-1);

		for (var i = 0; i < str.length; i++) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
		}

		return (crc ^ (-1)) >>> 0;
	},
	getObjectValue: function (obj, prop) {
		if (prop.PlatformHeaderParamName != null) {
			var value = this.getDescendantProp(obj.session, prop.PlatformHeaderParamName);
			return value;
		}
		var propName = prop.name;
		if (obj == null) {
			return null;
		}
		if (obj[propName] != null) {
			return obj[propName];
		}
		if (typeof (obj) == "object") {
			for (var i in obj) {
				if (obj.hasOwnProperty(i) && typeof (obj[i]) == "object") {
					var result = getObjectValue(obj[i], prop);
					if (result != null) {
						return result;
					}
				}
			}
		}

		return null;
	},
	getDescendantProp: function (obj, desc) {
		var arr = desc.split(".");
		while (arr.length && (obj = obj[arr.shift()]));
		return obj;
	},
	appSession: function (key, value) {
		if (key === undefined) {
			return store.fetch("_appSession") || {};
		}
		else {
			if (value === undefined) {
				var _s = store.fetch("_appSession") || {};
				return _s[key];
			}
			else {
				var _s = store.fetch("_appSession") || {};
				_s[key] = value;
				if (value===null) {					
					delete _s[key];
				}
				store.save("_appSession", _s);
			}
		}
	},
	solvePlatformForNewProcess : function(oldPlatformObject,newAPISchema){
		//if (typeof newAPISchema==="string") {
		//	newAPISchema = schema.getMethod(newAPISchema);
		//}
		//var newPlatfromObject =  extend(true,{},oldPlatformObject);
		//if (!newAPISchema || !newAPISchema.name) {
		//	throw new Error("Schema object is either empty or has no name propertry in it");			
		//}
		//newPlatfromObject.addApiName(newAPISchema.name);
		////platform.setRequestHeader(self.getHeader(req));
		//newPlatfromObject.addSchemaObject(newAPISchema);
		//return newPlatfromObject;
	},
	resolveNewAPIProcess : function(newAPIID,inObject,platformObject){
		//var deferred = new Def.Deferred();
		//var schemaObjectOfPreviousStateAPI = schema.getSchemaMethodByObjectID(newAPIID);
		//var newPlatformObject = utility.solvePlatformForNewProcess(platformObject, schemaObjectOfPreviousStateAPI);
		//processor.process(inObject, {}, newPlatformObject).done(function (results) {
		//	deferred.resolve(results);
		//}).fail(function (err) {
		//	deferred.reject(err);
		//});
		//return deferred.promise();
	},
	isEmpty: function (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop))
				return false;
		}

		return true;
	},
	getFirstTrue: function (a) {
		for (prop in a) {
			if (a.hasOwnProperty(prop) && a[prop]) {
				return prop;
			}
		}
		return null;
	},
	getPlatformHeader: function (req) {
		var header = {};

		for (prop in headerConfig) {
			if (headerConfig.hasOwnProperty(prop)) {
				header[prop] = this.dotnotationobject(req, headerConfig[prop]);
			}
		}
		header.applicationName = config.applicationName;
		return header;
	},
	getPropertiesFromObjectAsPerConfig: function (obj,propConfig) {
		var header = {};
		for (prop in propConfig) {
			if (headerConfig.hasOwnProperty(prop)) {
				header[prop] = this.dotnotationobject(obj, headerConfig[prop]);
			}
		}
		return header;
	},
	dotnotationobject: function (obj, is, value) {
		if (typeof is == 'string')
			return this.dotnotationobject(obj, is.split('.'), value);
		else if (is.length == 1 && value !== undefined) {
			if (obj[is[0]] == null) {
				return null;
			}
			return obj[is[0]] = value;
		}
		else if (is.length == 0)
			return obj;
		else {
			if (obj[is[0]] == null) {
				return null;
			}
			return this.dotnotationobject(obj[is[0]], is.slice(1), value);
		}
	},
	dotnotationobjectandfunction:function(obj, is, value){
		//if (is.indexOf("(")>0) {
		//is.	    
		//}
		var result = utility.dotnotationobject(obj, is, value);

		if (typeof result == "function") {
			return result();    
		}

	}

};
utility.YFunction = function * (reqParams,func,scope){
	yield func.call(scope,reqParams);
};

module.exports = utility;