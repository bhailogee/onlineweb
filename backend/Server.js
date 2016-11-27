/// <reference path= />
//Server.js
var config = require('./core/appConfig');
var listner = require('./core/endpoints/endpoints.js');
var dataservice = require('./core/common/dataservice.js')
var utility = require('./core/common/utility.js');
var constant = require('./core/common/constants.js');
var jobs = require("./core/common/jobs.js");
listner.startapp(config.port);
var local = {};
dataservice.getApplicationsList().then(function (result) {
	debugger;
	console.log(JSON.stringify(result));
	console.log("Application Data Cached");
	local.applicationsList = result.rows;
}).then(dataservice.getApplicationConnectors).then(function (result2) {
	//console.log(JSON.stringify(result2));
	console.log("Application Connectors Data Cached");
	debugger;
	local.applicationsConnector = result2.rows;
	var applicationSession = {};
	for (var i = 0; i < local.applicationsList.length; i++) {
		applicationSession[local.applicationsList[i]["ApplicationID"]] = {};
		var connectorID = local.applicationsList[i]["APIConnectorID"];
		var keys = Object.keys(local.applicationsList[i]);
		for (var jj = 0; jj < keys.length; jj++) {
			applicationSession[local.applicationsList[i]["ApplicationID"]][keys[jj]] = local.applicationsList[i][keys[jj]];
		}

		for (var kk = 0; kk < local.applicationsConnector.length; kk++) {
			if (local.applicationsConnector[kk]["APIConnectorID"] == connectorID) {
				var connectorKeys = Object.keys(local.applicationsConnector[kk]);
				for (var ll = 0; ll < connectorKeys.length; ll++) {
					applicationSession[local.applicationsList[i]["ApplicationID"]][connectorKeys[ll]] = local.applicationsConnector[kk][connectorKeys[ll]];
				}
			}
		}
	}
	debugger;
	utility.appSession(constant.applicationsList, applicationSession);
	//jobs.init();
});
console.log("API Mngr Started at " + config.port);