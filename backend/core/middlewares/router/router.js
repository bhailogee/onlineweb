//var securityHandler = require('./securityHandler.js');
//var SecurityError = require('./models/error.js');
//var platformClass = require('../../models/platform/platform.js');
//var extend = require('extend');
var handler = require("./routerHandler");
var utility = require('../../common/utility.js');
var constant = require('../../common/constants.js');

function router(inObject, outObject, platformObject) {

	if (handler.isMyCommands(inObject, outObject, platformObject))
	{
		var def = Def.Deferred();
		handler.executeMyCommand(inObject, outObject, platformObject).then(function (result) {
			platformObject.next = false;
			def.resolve({ inObject: inObject, outObject: result, platformObject: platformObject });
		});
		return def.promise();
	}
	else {
		var applicationID = platformObject.schema.getApplicationID();
		var appSession = utility.appSession(constant.applicationsList);
		debugger;
		switch (appSession[applicationID].APIConnectorID) {
			case 2:
				return handler.workflowSpecific(inObject, outObject, platformObject);
				break;
			default:
				return outObject;
		}
	}
}

var postprocess = function (inObject, outObject, platformObject) {
	if (platformObject.session.getClientRequestID()) {
		var applicationID = platformObject.schema.getApplicationID();
		var appSession = utility.appSession(constant.applicationsList);
		switch (appSession[applicationID].APIConnectorID) {
			case 2:
				handler.markClientRequestID(inObject, outObject, platformObject);
				break;
			default:
				return outObject;
		}
	}
}

	
var cons = {
	init: function () {
		router.postprocess = postprocess;
		return router;
	}
};

module.exports = cons.init();