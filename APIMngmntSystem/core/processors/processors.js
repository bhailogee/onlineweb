var config = require("../appConfig.js");
var con = {
	init: function () {
		var _processor;
		try {			
			((config.processor && (_processor = require(config.processor))) || (_processor = require("./base/base.js")));
		} catch (e) {
			throw e;
		}
		return _processor;
	}
}
var processor = con.init();
//processor._processor = con;
global.processor = processor;
module.exports = processor;