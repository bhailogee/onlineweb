var bodyModel = {
	apiname: {},
	payload: {}
}

var body = {
	createnew: function () {
		return new bodyModel;
	}
}

var Class = {
	cons: function () {
		return body.createnew;
	}
}
module.exports = Class.cons();