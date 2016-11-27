/////////////Models///////////
var headerModel = {
	ip: { value: null }
};

var header = {
	createnew: function () {
		return new headerModel;
	}
}

var Class = {
	cons: function () {
		return header.createnew;
	}
}
module.exports = Class.cons();