function constructor(context) {
	var self = {
		setHeader: function (reqHeader) {
			context.set(reqHeader, 'nodeHeader');
		},
		getHeader: function () {
			return context.get('nodeHeader');
		},
		getIP: function () {
			var n = self.getNodeHeader();
			return n.IP;
		}
	};
	return self;
}

module.exports = constructor;