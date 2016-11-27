var models = require("../../models/models.js");

var self = {
	resolve: function (req, res, next,schemaObj) {
		//var baseModel = models.base();
		var platform = models.platform();
		//baseModel.setPayLoad(self.getPayLoad(req));
		//platform.setApiName(self.getApiName(req));
		platform.client.setHeader(self.getHeader(req));
		platform.node.setHeader(self.getNodeHeader(req));
		platform.schema.setSchemaObject(schemaObj || self.getSchemaObject(req));
		platform.req = req;
		platform.res = res;
		//platform.setNodeIP(self.getNodeIP(req));
		return { payload: self.getPayLoad(req), platform: platform };
	},	
	getIP: function (req) {
		return req.connection.remoteAddress;
	},
	getApiName: function (req) {
		return req.param('apiName', null) || req.body.apiName;
	},
	getPayLoad: function (req) {
		return req.body ? req.body.payLoad : null;
	},
	getHeader: function (req) {
		return req.body ? req.body.header : null;
	},
	getSchemaObject: function (req) {
		return req.body ? req.body.schema : null;
	},
	getNodeIP: function (req) {
		var payLoad = this.getPayLoad(req);
		return payLoad ? payLoad.remoteIP : null;
	},
	getNodeHeader: function (req) {
		var nodeHeader = JSON.parse(JSON.stringify(req.headers));
		return nodeHeader;
	}
};

var Class = {
	cons: function () {
		return self;
	}
}



module.exports = Class.cons();