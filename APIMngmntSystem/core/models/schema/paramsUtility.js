var utility = require("../../common/utility.js");
var self = {
	getServerParamProperty: function (p) {
		return p.serverProperty;
	},
	resolveServerParam: function (p,platform) {
		var property = self.getServerParamProperty(p);
		return utility.getPropertiesFromObjectAsPerConfig(platform,property);
	},
	saveInServerParam: function (p, platform) {
		var property = self.getServerParamProperty(p);
		return utility.getPropertiesFromObjectAsPerConfig(platform, property);
	},
	getDefaultValue: function (p) {
		return p.default;
	},
	getParamName: function (p) {
		return p.name;
	},
	getParamType: function (p) {
		return p.type;
	},
	getParamLength: function (p) {
		return p.length;
	},
	getParamDirection: function (p) {
		var d = p.direction || '';
		return d.toLowerCase();
	}
};



module.exports = self;