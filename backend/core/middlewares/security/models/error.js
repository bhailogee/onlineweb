var extend = require('extend');
var errors = {
	authenticationError: function () {
		this.message = self.makeMsg(arguments[0], "Authentication Error in Security");
	},
	securityKeyError: function () {
		this.message = self.makeMsg(arguments[0], "Security Key not found Error in Security");
	},
	securityObjectError: function () {
		this.message = self.makeMsg(arguments[0], "Security Object not found Error in Security Store");
	},
	securityObjectExpired: function () {
		this.message = self.makeMsg(arguments[0], "Security Object Expired Error. Session Timeout");
	}
}

function error(message) {
	this.message = self.makeMsg(message, "General Error");
}


var self = {
	init: function () {
		for (a in errors) {
			if (errors.hasOwnProperty(a)) {
				errors[a].prototype = new Error();
			}
		}
		error = extend(true, error, errors);
		error.prototype = new Error();
		return error;
	},
	makeMsg: function () {
		var message = '';
		var _temp = '';
		for (var i = 0; i < arguments.length && (message += " ") ; i++, message += ".") {
			_temp = '';
			if (typeof arguments[i] != "string") {
				_temp = JSON.stringify(arguments[i]);
			}
			else {
				_temp = arguments[i];
			}
		}
		return message.trim();
	}
};


module.exports = self.init();