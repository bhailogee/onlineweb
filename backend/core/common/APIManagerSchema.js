var config = require('../appConfig.js');
var fs = require('fs');
var schemaObj = JSON.parse(fs.readFileSync(config.apiManagerSchema, 'utf8'));


var schemaParser = {
	schema: {},
	init: function (schema) {
		this.schema = schema;
	},
	getMethods: function () {
		return this.schema["Methods"];
	},
	getMethod: function (methodName) {

		var methods = this.getMethods();
		return methods[methodName];
	},
	getParameters: function (methodName) {
		var method = this.getMethod(methodName);
		if (method != null) {
			if (method["Params"] != null) {
				return method["Params"];
			}
			else {
				return {}; //No parameters available
			}
		}
		else {
			return null;
		}
	},
	getInParams: function (methodName) {
		var params = this.getParameters(methodName);
		//TODO: find in params list and return
	},
	getOutParams: function () {
		var params = this.getParameters(methodName);
		//TODO: find out params list and return
	},
	getRestMethods: function () {

		var t = {};
		var methods = this.getMethods();
		for (var prop in methods) {
			if (methods.hasOwnProperty(prop)) {
				if (methods[prop].Method != null) {
					t[prop] = methods[prop];
				}
			}
		}
		return t;
	},
	getUnsecuredMethods: function () {
		if (!this.getUnsecuredMethodsProcessed) {
			this.getUnsecuredMethodsList = [];
			this.getUnsecuredMethodsProcessed = true;
		}
		return this.getUnsecuredMethodsList;
	},
	getLoginMethods: function () {
		var methods = [];
		methods.push('TX_AuthenticateAdminUser');
		return methods;
	},
	getLogoutMethods: function () {
		var methods = [];
		methods.push('TX_LogoutAdminUser');
		return methods;
	},
	getSecuredMethods: function () {
		return [];
	}
};

schemaParser.init(schemaObj);

module.exports = schemaParser;




