var models = require("../models/models.js");
var schema = require("./schema.js");

function PlatformHandler() {
	var self = this;
	self.resolve = function (platformObject, apiName) {
		var platform = models.platform();
		platform.client.setHeader(platformObject.client.getHeader());
		platform.node.setHeader(platformObject.node.getHeader());
		var schemaObj = schema.getMethod(apiName);
		platform.schema.setSchemaObject(schemaObj);
		return platform;
	},
	self.execute = function (apiName, inObject, outObject, platformObject,oldInObject) {
		if (platformObject == undefined) {
			platformObject = self.newPlatFormObject;
		}
		//if (oldInObject)
		//{
		//	inObject.v_TXID = oldInObject.v_TXID;
		//}
		self.newPlatFormObject = self.resolve(platformObject, apiName);
		return processor.process(inObject, outObject, self.newPlatFormObject);
	}
	return self;
}

var Class = {
	cons: function () {
		return PlatformHandler;
	}
}

module.exports = Class.cons();