var handlers = {
	unauthorisedRequest: function (res) {
		handlers.sendResponse(res, 401, "unauthorised request");
	},
	expiredSessionRequest: function (res) {
		handlers.sendResponse(res, 401, "session expired. login required");
	},
	badRequest: function (res) {
		handlers.sendResponse(res, 400, "bad request");
	},
	badRequestSessionMissing: function (res) {
		handlers.sendResponse(res, 400, "bad request, session id is missing");
	},
	sendResponse: function (res, code, msg) {
		res.status(code).send({ error: msg });
		res.end();
	}
}


module.exports = handlers;