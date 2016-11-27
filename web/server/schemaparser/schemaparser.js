var config = require('../../config/config');
var fs = require('fs');
var schemaObj = JSON.parse(fs.readFileSync(config.serverschema, 'utf8'));
var utility = require('../utility/utility');


var schemaParser = {
	schema: {},
	restMethods: {},
	schemaRoutes: {},
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
	getSchemaMethodByRoute: function (method, route) {
		return this.schemaRoutes[utility.getFirstTrue(method)][route];
	}
};

schemaParser.init(schemaObj[config.packageName]);

module.exports = schemaParser;




