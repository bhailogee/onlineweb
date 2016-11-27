

function constructor(context) {

	var self = {
		setHeader: function (reqHeader) {
			context.set(reqHeader, 'clientHeader');
		},
		getHeader: function () {
			return context.get('clientHeader');
		},
		getSessionKey: function () {
			var clientHeader = this.getHeader();
			return clientHeader.authToken;
		}
	}

	return self;
};

module.exports = constructor;