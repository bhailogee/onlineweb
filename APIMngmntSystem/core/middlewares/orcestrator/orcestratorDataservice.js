var dataservice = require('../../common/dataservice.js');
var utility = require('../../common/utility.js');
var constants = require('../../common/constants.js');



var securityDataservice = {	
	getACLList: function (applicationName) {
		var apps = utility.appSession(constants.applicationsList);
		return apps[applicationName];		
	},
	checkACL: function (inObject, outObject, platformObject) {
		var applicationName = platformObject.getPlatformComponentName();
		var applicationObject =this.getACLList(applicationName);
		platformObject.setACLObject(result);
		return result.applicationInstanceIPs.indexOf(platformObject.getNodeIP()) > -1;
	},
	authenticateByUserNamePassword: function (inObject, outObject, platformObject) {
		var payLoad = inObject.getPayLoad();
		var userName = payLoad["userName"];
		var password = payLoad["password"];
		var remoteIP = platformObject.getRequestHeader().remoteIP;
		return dataservice.authenticateAdminByPassword(userName,password,remoteIP);
	},
	authenticateByOAuth: function (inObject, outObject, platformObject) {

	},
	addClientRequest: function (inObject, outObject, platformObject) {
		var payLoad = inObject.getPayLoad();
		var userName = payLoad["userName"];
		var password = payLoad["password"];
	}
};

module.exports = securityDataservice;

