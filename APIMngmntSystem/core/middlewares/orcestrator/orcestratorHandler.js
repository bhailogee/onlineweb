var fs = require('fs');
var Def = require("jquery-deferred");
var securityConfig = JSON.parse(fs.readFileSync('./core/middlewares/security/securityConfig.json', 'utf8'));
var store = require('../../common/store.js');
var schema = require('../../common/schema.js');
var securityDataservice = require('./securityDataservice.js');
var securityModel = require('./models/base.js');
var appSchema = require('../../common/APIManagerSchema.js');
var dataservice = require("../../common/dataservice.js");

var handler = {
	isACLRequired: function () {
		return securityConfig.isACLRequired || false;
	},
	checkACL: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		if (!this.isACLRequired) {
			def.resolve(true);
			return def.promise();
		}
		try {
			securityDataservice.checkACL(inObject, outObject, platformObject).then(function (result) {
				return result;
			});
		} catch (e) {
			def.reject(false);
		}
		return def.promise();
	},
	isRequired: function (inObject, outObject, platformObject) {
		var apiName = platformObject.getAPIName();
		var unsecuredMethodsList =  schema.getUnsecuredMethods();
		return unsecuredMethodsList.indexOf(apiName) == -1;		
	},
	isLoginRequest: function (inObject, outObject, platformObject) {

		var apiName = platformObject.getAPIName();
		var applicationName = platformObject.getPlatformComponentName();
		securityDataservice.getACLList(applicationName).then(function () {

		});
		var loginMethods = schema.getLoginMethods();
		return loginMethods.indexOf(apiName) != -1;
	},
	isLogoutRequest: function (inObject, outObject, platformObject) {
		var apiName = platformObject.getAPIName();
		var logoutMethods = schema.getLogoutMethods();
		return loginMethods.indexOf(apiName) != -1;
	},
	hasSecurityKey: function (inObject, outObject, platformObject) {
		var securityKey = inObject.getSecurityKey();
		return securityKey ? securityKey : !1;		
	},
	hasSecurityObject: function (securityKey) {
		var securityObject = securityModel.load(securityKey);
		return securityObject ? securityObject : !1;		
	},
	validate: function (inObject, outObject, platformObject) {
		var securityKey = inObject.getSecurityKey();
		if (!securityKey) {
			return false;
		}
		var securityObject  = securityModel.load(securityKey);
		if (!securityObject || !handler.isValid(securityObject)) {
			return false;
		}
		return securityObject;
	},
	isValid: function (securityObject) {
		if (this.isExpired(securityObject)) {
			return false;
		}
		if (securityObject.isAuthenticated()) {
			return false;
		}
		securityObject.validated(true);
		return true;
	},
	isExpired: function (securityObject) {
		var timeDiff = new Date().getTime() - new Date(securityObject.lastTouched()).getTime();
		return securityConfig.sessionExpireTime < timeDiff;
	},
	newSecurityModel: function () {
		return securityModel();
	},
	authenticateBySecurityType: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		var requiredSecurityType = platformObject.getAPIName();

		switch (requiredSecurityType) {
			case "usernamePassword":
				return securityDataservice.authenticateByUserNamePassword(inObject, outObject, platformObject);
				break;
			case "oAuth":
				return securityDataservice.authenticateByOAuth(inObject, outObject, platformObject);
				break;
		}

		return def.promise();
	},
	authenticateByAPI: function (inObject, outObject, platformObject) {
		var requiredSecurityApi = platformObject.getAPIName();
		var inParams = appSchema.getInParams(requiredSecurityApi);
		var outParams = appSchema.getOutParams(requiredSecurityApi);
		//TODO: mapInParams with inObject and Platform using inParams from schema
		var mapInParams = [];
		////////////////////////////


		return dataservice.executeByAPI(requiredSecurityApi, mapInParams, outParams);
	},
	authorise: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		var defArray = [];
		var applicationACLObject = platformObject.getACLObject();
		if (applicationACLObject.authorizationAPIs.length > 0) {
			var authorisationAPIs = applicationACLObject.authorizationAPIs;
			for (var i = 0; i < authorisationAPIs.length; i++) {
				var inParams = appSchema.getInParams(requiredSecurityApi);
				var outParams = appSchema.getOutParams(requiredSecurityApi);
				//TODO: mapInParams with inObject and Platform using inParams from schema
				var mapInParams = [];

				defArray.push(dataservice.executeByAPI(authorisationAPIs[i], mapInParams, outParams));
			}
		}
		if (defArray.length > 0) {
			Def.when.apply(null, defArray).then(function (results) {
				for (var i = 0; i < results.length; i++) {
					if (!results[i][0]) {
						def.resolve(false);
					}
				}
				def.resolve(true);
			}).fail(function (err) {
				def.reject(err);
			});
		}
		else {
			def.resolve(true);
		}
	},
	addClientRequest: function (inObject, outObject, platformObject) {
		var methodName = platformObject.getAPIName();
		var inParams = appSchema.getInParams(methodName);
		var outParams = appSchema.getOutParams(methodName);
		//TODO: mapInParams with inObject and Platform using inParams from schema
		var mapInParams = [];
		////////////////////////////


		return dataservice.executeByAPI("TX_AddClientRequest", mapInParams, outParams);
	}
};

module.exports = handler;