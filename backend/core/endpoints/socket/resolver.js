var models = require("../../models/models.js");

var self = {
	resolve: function (socket, data, schemaObj) {
		//var baseModel = models.base();
		var platform = models.platform();
		//baseModel.setPayLoad(self.getPayLoad(req));
		//platform.setApiName(self.getApiName(req));
		platform.client.setHeader(self.getHeader(data));
		platform.node.setHeader(self.getNodeHeader(data));
		platform.schema.setSchemaObject(schemaObj || self.getSchemaObject(data));

		//platform.req = req;
		//platform.res = res;
		//platform.setNodeIP(self.getNodeIP(req));
		return { payload: data.payLoad, platform: platform };
	},
	//getIP: function (req) {
	//	return req.connection.remoteAddress;
	//},
	//getApiName: function (req) {
	//	return req.param('apiName', null) || req.body.apiName;
	//},
	//getPayLoad: function (req) {
	//	return req.body ? req.body.payLoad : null;
	//},
	getHeader: function (body) {
		return body.header|| null;
	},
	getSchemaObject: function (body) {
		return body.schema || null;
	},
	//getNodeIP: function (req) {
	//	var payLoad = this.getPayLoad(req);
	//	return payLoad ? payLoad.remoteIP : null;
	//},
	getNodeHeader: function (req) {
		var nodeHeader = req.headers || null;
		return nodeHeader;
	}
};

var Class = {
	cons: function () {
		return self;
	}
}



module.exports = Class.cons();