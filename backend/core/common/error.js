var extend = require('extend');
var errors = {
	connectionNotAvailable: function (message) {
		return self.makeMsg(message, "Connection not available");
	},
	beginTransactionFailure: function (message) {
		return  self.makeMsg(message, "Begin transaction failed");
	},
	getPoolConnectionFailure: function (message) {		
		return  self.makeMsg(message, "Getting new connection from pool failure");
	},
	executeQueryError: function (message) {
		return  self.makeMsg(message, "Query executed with error");
	},
	commitError: function () {
		return  self.makeMsg(arguments[0], "Commit with error");
	}
}

function error(message) {
	return  self.makeMsg(message, "General Error");
}


var self = {
	init: function () {
		for (a in errors) {
			if (errors.hasOwnProperty(a)) {
				errors[a].prototype = extend(true, errors[a].prototype, Error.prototype);
				//errors[a].prototype = Error.prototype;
			}
		}
		error = extend(true, error, errors);
		error.prototype = new Error();
		return error;
	},
	makeMsg: function () {
		var message = '';
		var _temp = '';		
		for (var i = 0; i < arguments.length && (message += " ") ; i++, message += _temp+".") {
			_temp = '';
			if (arguments[i].message) {
				_temp += arguments[i].message+".";
			}
			else if (typeof arguments[i] != "string") {
				_temp += JSON.stringify(arguments[i]);
			}
			else {
				_temp += arguments[i];
			}
		}
		return message.trim();
	}
};


module.exports = self.init();