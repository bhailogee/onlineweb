
//var header = require('header.js');
//var body = require('body.js');
//var baseModel = {
//	header: header(),
//	body: body()	
//}
var utility = require('../../common/utility.js');
var extend = require('extend');
var baseFunctions = {
	setIP: function (ip) {
		this.header = this.header || {};
		this.header.ip = ip;
	},
	getIP: function () {
		return this.header.ip;
	},	
	setPayLoad: function (payload) {
		this.body = this.body || {};
		this.body.payload = payload;
	},
	getPayLoad: function () {
		return this.body.payload;
	},
	getSecurityKey: function () {
		if (this.header == null || this.header._security == null) {
			return null;
		}
		return this.header._security.key;
	},	
	setSecurityKey: function (key) {
		//key = key || utility.getUniqueID(); //for auto generating keys
		this.header = this.header || {};
		this.header._security = this.header._security || {};
		this.header._security.key = key;
	},
	setHeader: function (_header) {	
		extend(true, this.header || {}, _header);
	}
};


var base = {
	create: function () {
		var model = base.createnew();
		return extend(true, model, baseFunctions);		
	},
	createnew: function () {
		var baseModel = {
			header: {
				_ip: { value: null },
				_security: { key: null }
			},
			body: {
				//apiname: {},
				payload: {}
			}
		}
		return baseModel;
	}
}
base.create.baseFunctions = baseFunctions;
var Class = {
	cons: function () {
		return base.create;
	}
}
module.exports = Class.cons();