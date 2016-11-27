var processor = require("../processors/processors.js");
var config = require("../appConfig.js");


var con = {
	init: function () {
		var _endpointlistner;
		try {
			((config.endpoint && (_endpointlistner = require(config.endpoint))) || (_endpointlistner = require("./express/express.js")));
		} catch (e) {
			throw e;
		}

		_endpointlistner.init(processor);
		return _endpointlistner;
	}
}
var endpoint = con.init();
endpoint._endpoint = con;
module.exports = endpoint;