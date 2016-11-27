var ResponseModel = {
	getModel: function (code, statusmessage, message, result) {
		var response =
			   {
			   	status: {
			   		statusmessage: statusmessage,
			   		code: code,
			   		message: message
			   	},
			   	result: result
			   };
		return response;
	},
	success: function (result) {
		return this.getModel("", "Success", "", result);
	},
	error: function (errormessage,result) {
		return this.getModel(-1, "Error", errormessage, result);
	},
	errorcode: function () {

	}
};

module.exports = ResponseModel;