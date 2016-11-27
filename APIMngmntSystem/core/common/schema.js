var config = require('../appConfig.js');
var fs = require('fs');
var schemaObj = JSON.parse(fs.readFileSync(config.schema, 'utf8'));
var utility = require('./utility');


var tesCommands = {
	"datatofile": {
		"CompletePath": "/datatofile",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "Rollback",
		"Params": [
			{ "name": "v_FileName", "type": "String", "direction": "in" },
			{ "name": "v_Template", "type": "String", "direction": "in" },
			{ "name": "v_Data", "type": "String", "direction": "in" }
		]
	}
};
var commandMethods = {
	"__RollbackTX": {
		"CompletePath": "/RollbackTX",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "RollbackTX",
		"Params": [
			{ "name": "p_TXID", "type": "Integer", "direction": "out" }
		]
	},
	"__RollbackGlobalTransaction": {
		"CompletePath": "/RollbackGlobalTransaction",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "RollbackGlobalTransaction",
		"Params": [
			{ "name": "p_GlobalRequestID", "type": "Integer", "direction": "out" }
		]
	},
	"__RollbackClientRequest": {
		"CompletePath": "/RollbackClientRequest",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "RollbackClientRequest",
		"Params": [
			{ "name": "p_ClientRequestID", "type": "Integer", "direction": "out" }
		]
	},
	"__Begin": {
		"CompletePath": "/__Begin",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "Begin",
		"Params": []
	},
	"__Commit": {
		"CompletePath": "/__Commit",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "Commit",
		"Params": []
	},
	"__Rollback": {
		"CompletePath": "/__Rollback",
		"HttpMethod": "POST",
		"ApplicationID": "1",
		"ApplicationName": "Platform",
		"APIName": "Rollback",
		"Params": []
	}
};

var schemaParser = {
	schema: {},
	restMethods: {},
	schemaRoutes: {},
	init: function (schema) {
		this.schema = schema;
		for (var prop in commandMethods) {
			this.schema["Methods"][prop] = commandMethods[prop];
		}
		for (var prop in tesCommands) {
			this.schema["Methods"][prop] = tesCommands[prop];
		}
	},
	getMethods: function () {
		return this.schema["Methods"];
	},
	addMethod: function (name,methodObject) {
		var methods = this.getMethods();
		methods[name] = methodObject;
	},
	getMethod: function (methodName) {
		var methods = this.getMethods();
		var method = methods[methodName];
		if (method) {
			method.name = methodName;
		}
		return method;
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

		for (var i = 0; i < params.length; i++) {
			if (params[i].direction == "in") {
				inParams.push(params[i]);
			}
		}
		return inParams;		
	},
	getOutParams: function (methodName) {
		var params = this.getParameters(methodName);
		for (var i = 0; i < params.length; i++) {
			if (params[i].direction == "out") {
				outParams.push(params[i]);
			}
		}
		return outParams;
	},
	getRestMethods: function () {
		if (utility.isEmpty(this.restMethods)) {
			var methods = this.getMethods();
			for (var prop in methods) {
				if (methods.hasOwnProperty(prop)) {
					if (methods[prop].HttpMethod != null && methods[prop].CompletePath) {
						methods[prop].HttpMethod = methods[prop].HttpMethod.toLowerCase();
						methods[prop].name = prop;
						this.restMethods[prop] = methods[prop];
						this.schemaRoutes[methods[prop].HttpMethod] = this.schemaRoutes[methods[prop].HttpMethod] || {};
						this.schemaRoutes[methods[prop].HttpMethod][methods[prop].CompletePath] = this.restMethods[prop];
					}
				}
			}
		}
		return this.restMethods;
	},
	getUnsecuredMethods: function () {
		if (!this.getUnsecuredMethodsProcessed)
		{
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
	},
	getApplicationName: function (methodName) {
		var method = this.getMethod(methodName);
		return method.applicationName;
	},
	getApplicationAPIName: function (methodName) {
		var method = this.getMethod(methodName);
		return method.applicationAPIName;
	},
	getSchemaMethodByObjectID: function (apiID) {
		//TODO : return schema Object by apiID;
	},
	getSchemaByAPIID: function (apiID) {
		//TODO: return apiid property from schemaObject passed
		if (!schemaParser.methodsByAPI)
		{
			schemaParser.methodsByAPI = [];
			var methods = schemaParser.getMethods();
			for (var prop in methods) {
				if (methods.hasOwnProperty(prop)) {
					schemaParser.methodsByAPI[methods[prop].APIID] = methods[prop];
				}
			}
		}
		return schemaParser.methodsByAPI[apiID];
	},
	getSchemaMethodByRoute: function (method, route) {
		return this.schemaRoutes[utility.getFirstTrue(method)][route.substring(1)];
	},
	getPreviousStateAPIName: function (s) {
		return s.GetPreviousStateAPIName;
	},
	getUndoAPIName: function (s) {
		return s.UndoAPIName;
	},
	getUndoTranslationMap: function (s) {
		return s.UndoTranslationMap;
	},
	getPreviousStateTranslationMap: function (s) {
		return s.GetPrevStateTranslationMap;
	},
	getSetRecordStateAPIName: function (s) {
		return s.SetRecordStateAPIName;
	},
	getSetRecordStateTranslationMap: function (s) {
		return s.SetRecordStateTranslationMap;
	},
};

schemaParser.init(schemaObj[config.packageName]);

module.exports = schemaParser;