var headerConfig = require('./platformheader');
var config = require('../../config/config');
var utility = {
	getPlatformHeader: function (req) {
		var header = {};

		for (prop in headerConfig) {
			if (headerConfig[prop] && headerConfig[prop].split(".")[0] == "config") {
				header[prop] = config[headerConfig[prop].split(".")[1]];
			} else if (headerConfig.hasOwnProperty(prop)) {
				header[prop] = this.dotnotationobject(req, headerConfig[prop]);
			}
		}
		header.applicationName = config.applicationName;
		return header;
	},
	dotnotationobject: function (obj, is, value) {
		if (typeof is == 'string')
			return this.dotnotationobject(obj, is.split('.'), value);
		else if (is.length == 1 && value !== undefined) {
			if (obj[is[0]] == null) {
				return null;
			}
			return obj[is[0]] = value;
		}
		else if (is.length == 0)
			return obj;
		else {
			if (obj[is[0]] == null) {
				return null;
			}
			return this.dotnotationobject(obj[is[0]], is.slice(1), value);
		}
	},
	isEmpty: function (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop))
				return false;
		}

		return true;
	},
	getFirstTrue: function (a) {
		for (prop in a) {
			if (a.hasOwnProperty(prop) && a[prop]) {
				return prop;
			}
		}
		return null;
	}
}


module.exports = utility;