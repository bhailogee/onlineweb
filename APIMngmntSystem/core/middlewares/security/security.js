var securityHandler = require('./securityHandler.js');
var SecurityError = require('./models/error.js');
var platformClass = require('../../models/platform/platform.js');
var extend = require('extend');
var Def = require("jquery-deferred");

var platfromSecurityModelFunctions = {
	setSecurityObject: function (securityModel) {
		this.set(securityModel, "security");
	},
	getSecurityObject: function () {
		this.get("security");
	},
	getACLObject: function () {
		this.get("ACLObject");
	},
	setACLObject: function (aclObject) {
		this.set(aclObject, "ACLObject");
	}
};


//var ACLObject = {
//  isSecure:true,
//	loginAPIs: [],
//	applicationInstanceIPs: [],
//  authorizationAPIs:[]
//};
platformClass.baseFunctions = extend(true, platformClass.baseFunctions, platfromSecurityModelFunctions);

function security(inObject, outObject, platformObject) {

	///TODO : Start Request ID in security if validated correctly
	var def = Def.Deferred();
	if (securityHandler.checkACL(inObject, outObject, platformObject)) {
		//if (!securityHandler.isRequired(inObject, outObject, platformObject)) {
		//	platformObject.setSecurityObject(securityHandler.newsecurityModel());
		//	return outObject;
		//};

		//if (securityHandler.isLoginRequest(inObject, outObject, platformObject)) {
		//	// TODO: Handle Login
		//	platformObject.setSecurityObject(securityHandler.newsecurityModel());
		//	return outObject;
		//};
		//if (securityHandler.isLogoutRequest(inObject, outObject, platformObject)) {
		//	// TODO: Handle Logout
		//	return outObject;
		//};
		var securityKey = securityHandler.hasSecurityKey(inObject, outObject, platformObject);
		if (!securityKey) {
			var applicationACLObject = platformObject.getACLObject();
			if (!applicationACLObject.isSecure) {
				var securityObject = securityHandler.newsecurityModel();
				securityObject.authenticated(false);
				platformObject.setSecurityObject(securityObject);
				return;
			}
			else {

				if (applicationACLObject.loginAPIs.indexOf(platformObject.getAPIName()) > -1) {
					securityHandler.authenticateByAPI(inObject, outObject, platformObject).done(function (result) {
						var securityObject = securityHandler.newsecurityModel();
						securityObject.setAuthenticatedIDs(result);
						securityObject.authenticated(true);
						platformObject.setSecurityObject(securityObject);
					});

					return;
				}
				else {
					throw new SecurityError.securityKeyError("Security Key Expected. Security key not found");
				}
			}
		} else {
			var securityObject = securityHandler.hasSecurityObject(securityKey);
			if (!securityObject) {
				throw new SecurityError.securityObjectError("Security Object not found against security key: " + securityKey);
			};
			if (securityObject.isExpired()) {
				securityHandler.handleSessionTimeOut(securityObject);
				throw new SecurityError.securityObjectExpired("Session Timeout. Security Object expired");
			}
			platformObject.setSecurityObject(securityObject);
		}

		securityHandler.authorise(inObject, outObject, platformObject).done(function (result) {
			if (!result) {
				throw new SecurityError.securityKeyError("Authorisation Failed");
			}
			else {

				var _secureObj = platformObject.getSecurityObject();
				_secureObj.authorised(true);
				platformObject.setSecurityObject(_secureObj);

				securityHandler.addClientRequest(inObject, outObject, platformObject), done(function (addClientRequestResult) {
					platformObject.setRequestID(addClientRequestResult.v_ClientRequestID);
					def.resolve({ inObject: inObject, outObject: outObject, platformObject: platformObject });
					return;
				});


				//platformObject.setSecurityObject(securityObject);
				//var securityObject = securityHandler.newsecurityModel();
				//securityObject.setAuthenticatedIDs(result);
				//securityObject.isAuthenticated(true);
				//platformObject.setSecurityObject(securityObject);
			}
		}).fail(function (err) {
			throw new SecurityError.securityKeyError("authorization error");
		});
	}
	else {
		throw new SecurityError.authenticationError("ACL Failed");
	}


	return def.promise();
}

var postprocess = function (inObject, outObject, platformObject) {

}

	
var cons = {
	init: function () {
		security.postprocess = postprocess;
		return security;
	}
};

module.exports = cons.init();