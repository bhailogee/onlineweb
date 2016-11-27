var constants = require("../../common/constants.js");
var handler = require('./resourceManagerHandler.js');
//var SecurityError = require('./models/error.js');
var platformClass = require('../../models/platform/platform.js');
var extend = require('extend');
var utility = require('../../common/utility.js');



//TODO: boot resouce Manager instances as per applications list.
//if getpreviousStateID in api Schema Object
// map 
//Add_TX Proc

var resourceManager = {
	setResourceManageObject: function (securityModel) {
		this.set(securityModel, constants.resourceManager);
	},
	getResourceManagerObject: function () {
		this.get(constants.resourceManager);
	},
	getRequestID: function () {
		var rm = this.getResourceManagerObject();
		return rm.requestID;
	},
	setRequestID: function (requestID) {
		var rm = this.getResourceManagerObject();
		rm.requestID = requestID;
	}
};
platformClass.baseFunctions = extend(true, platformClass.baseFunctions, resourceManager);

function resourceManager(inObject, outObject, platformObject) {

	var deferred = Def.Deferred();

	handler.fetchPreviousState(inObject, outObject, platformObject).done(function (previousStateData) {
		handler.addRequest(inObject, outObject, platformObject, previousStateData).done(function (result) {
			platformObject.setRequestID(result.v_TXID);

		});
	});



	var appName = platformObject.getApplicationName();
	return resourceManager.resourceManagerInstances[appName]();
}

var postprocess = function (inObject, outObject, platformObject) {

}
function createAppInstaceOfResourceManager(appName, app) {
	return new resourceManagerClass(appName, app);
}
function resourceManagerClass(appName, app) {
	var executedScripts;
	//it should be a list of scripts in following format... 
	//[{	
	//	"name":"successScriptName",
	//	"path":"../pathtothisscript.js"
	//},
	//{	
	//	"name":"failScriptName",
	//	"path":"../pathtothisscript.js"
	//}]

	if (app.resourceManagerScripts) {
		if (Object.prototype.toString.call(app.resourceManagerScripts) !== '[object Array]') {
			app.resourceManagerScripts = [app.resourceManagerScripts];
		}

		for (var i = 0; i < app.resourceManagerScripts.length; i++) {
			executedScripts[app.resourceManagerScripts[i].name] = require(app.resourceManagerScripts[i].path);
		}
	}
	return executedScripts;
}
	
var cons = {
	init: function () {
		var apps = utility.appSession(constants.applicationsList);
		resourceManager.resourceManagerInstances = {};
		for (app in apps) {
			resourceManager.resourceManagerInstances[app] = createAppInstaceOfResourceManager(app, apps[app]);
		}
		resourceManager.postprocess = postprocess;
		return resourceManager;
	}
};

module.exports = cons.init();