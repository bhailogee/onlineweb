/// <reference path="" />
var Def = require("jquery-deferred");
var dataservice = require("../../common/dataservice.js");

function authorization(inObject, outObject, platformObject) {
	//if (platformObject.schema.isAuthenticationRequired()) {
	//var permissions = platformObject.session.getServerParam("sessionState.v_Permissions");
	//try {
	//	permissions = JSON.stringify(permissions);
	//	var htppMethod = platformObject.schema.getHttpMethod();
	//	var completePath = platformObject.schema.getCompletePath();

	//} catch (e) {

	//}
	var deferred = Def.Deferred();
	try {

	
	dataservice.getAPIAuthorisation(platformObject.session.getServerParam("sessionState.v_AdministratorID"), platformObject.session.getServerParam("clientState.portalID"), platformObject.schema.getCompletePath(), platformObject.schema.getHttpMethod()).done(function (result) {

		if (result && result.v_ReturnCode == 0) {
			console.log("[debug] API Authorized");
			deferred.resolve(outObject);
		}
		else {
			console.error("[debug] API Not Authorized");
			deferred.reject(new Error("Unauthorized API Call"));
			platformObject.next = false;
			return;
		}

	}).fail(function () {
		console.error("[debug] Cannot find its Authorization details");
		deferred.reject(new Error("Cannot find its Authorization details"));
		platformObject.next = false;
		return;
	});
	} catch (e) {
		debugger;
	}
	return deferred;
	//}
	//else {
	//	return outObject;
	//}

}

function postprocess(inObject, outObject, platformObject) { }

var cons = {
	init: function () {
		authorization.postprocess = postprocess;
		return authorization;
	}
};

module.exports = cons.init();