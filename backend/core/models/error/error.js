var self = {
	init: function () {
		platformErrors.middlewarenotsupported.prototype = new Error();
		return platformErrors;
	}
};

var platformErrors = {
	middlewarenotsupported: function (message) {
		this.message = message;
	}
}

module.exports = self.init();