var dataservice = require('../../common/dataservice');
var socketConnection = require('../../common/txc');

var appSchema = require('../../common/schema.js');
var utility = require('../../common/utility.js');
var constant = require('../../common/constants.js');
var WorkflowAPIs = require('../../../workflows');
var deferred = require("jquery-deferred");
//var handler = require("./gatewayHandler.js");

function gateway(inObject, outObject, platformObject) {
	
	var applicationID =platformObject.schema.getApplicationID();
	var appSession = utility.appSession(constant.applicationsList);
	switch(appSession[applicationID].APIConnectorID)
	{
		case 1:
            console.log("--------------------------");
			console.log("[debug] Mysql Called");
            console.log("--------------------------");
			return MySqlGateway(inObject, outObject, platformObject);
			break;
		case 2:
            console.log("--------------------------");
			console.log("[debug] Workflow Called");
            console.log("--------------------------");
			return NodeWorkFlows(inObject, outObject, platformObject);
			break;
		case 8:
			console.log("--------------------------");
			console.log("[debug] TXC Called");
			console.log("--------------------------");
			return Socket(inObject, outObject, platformObject);
			break;
		default:
			//return NodeWorkFlows(inObject, outObject, platformObject);
			console.error("API Connector ID not found for application " + applicationID);
			return outObject;
			break;
	}
}


function MySqlGateway(inObject, outObject, platformObject) {

	var query = platformObject.schema.getMySQLQuery();
	//var inParams = platformObject.schema.resolveInput(inObject);
	var params = platformObject.schema.getInParams();
	var arrinObject = [];
	for (var i = 0; i < params.length; i++) {
		if (params[i].serverProperty == null) {
			if (inObject[params[i].name] != null) {

                console.log("------------------------------------");

                console.log("params" + inObject[params[i].name]);

                console.log("------------------------------------");

				if ("decimal,tinyint,bigint".indexOf(params[i].type > -1) && inObject[params[i].name] == "") {
					arrinObject.push(params[i].default);

                    console.log("------------------------------------");

                    console.log("arrinObject" + arrinObject);

                    console.log("------------------------------------");
					continue;
				}
			}
			else {
				arrinObject.push(params[i].default);
				continue;
			}
		}
		arrinObject.push(inObject[params[i].name]);
	}

	//var tranObject = platformObject.getTransactionObject();

	//if (tranObject && tranObject.geyKey())
	//{

	//}
	//var arrinObject = Object.keys(inObject).map(function (key) { return obj[key] });
	return dataservice.executeByQuery(query, arrinObject, platformObject).then(function (r) {
		debugger;
		return r;
	});
}

function Socket(inObject, outObject, platformObject) {
	
	var query = platformObject.schema.getMySQLQuery();
	//var inParams = platformObject.schema.resolveInput(inObject);
	var params = platformObject.schema.getInParams();
	var arrinObject = [];
	for (var i = 0; i < params.length; i++) {
		if (params[i].serverProperty == null) {
			if (inObject[params[i].name] != null) {

				console.log("------------------------------------");

				console.log("params" + inObject[params[i].name]);

				console.log("------------------------------------");

				if ("decimal,tinyint,bigint".indexOf(params[i].type > -1) && inObject[params[i].name] == "") {
					arrinObject.push(params[i].default);

					console.log("------------------------------------");

					console.log("arrinObject" + arrinObject);

					console.log("------------------------------------");
					continue;
				}
			}
			else {
				arrinObject.push(params[i].default);
				continue;
			}
		}
		arrinObject.push(inObject[params[i].name]);
	}
	return dataservice.constructor(socketConnection).executeByQuery(query, arrinObject, platformObject);
}

function NodeWorkFlows(inObject, outObject, platformObject) {
	var _def = deferred.Deferred();

	var returnedObject = WorkflowAPIs.workflows[platformObject.schema.getAPIName()](inObject, outObject, platformObject);
	if (returnedObject) {
		if (returnedObject.done) {
			returnedObject.done(function (resultDone) {
				_def.resolve(resultDone);
			}).fail(function (err) {
				_def.reject(err);
			});
		} else {
			_def.resolve(returnedObject);
		}
	}
	else {
		_def.resolve(outObject);
	}
	return _def.promise();
}



var postprocess = function (inObject, outObject, platformObject) {

}


var cons = {
	init: function () {
		gateway.postprocess = postprocess;
		return gateway;
	}
};

module.exports = cons.init();