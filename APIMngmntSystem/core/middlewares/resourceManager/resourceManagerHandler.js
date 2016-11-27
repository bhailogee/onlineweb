
var tPlatformHandler = require('../../common/PlatformHandler.js');
var constant = require('../../common/constants.js');
var utility = require('../../common/utility.js');
var dataservice = require('../../common/dataservice.js')
var Def = require("jquery-deferred");
var mapp = require('../../common/mapper.js');
var schema = require('../../common/schema.js');
var myCommands = [
	"RollbackTX"
];
var handler = {
	identifySuccess: function (inObject, outObject, platform) {

		var resultParam = platform.schema.getAPIResponseResultParamName();
		var responseParamRegex = platform.schema.getResponseParamToResultRegex();
		if (!(responseParamRegex && resultParam)) {
			var applicationID = platform.schema.getApplicationID();
			var appSession = utility.appSession(constant.applicationsList);
			resultParam = appSession[applicationID].AppResponseResultParamName;
			responseParamRegex = appSession[applicationID].ResponseParamToResultRegex;
		}

		var rePattern = new RegExp(responseParamRegex);
		var returnResult = rePattern.test(outObject[resultParam]) ? "Success" : "Failure";
		return { result: returnResult, returnParam: outObject[resultParam] };
	},
	isMyCommand: function (inObject, outObject, platformObject) {
		var appName = platformObject.schema.getApplicationName();
		if (appName == "Platform") {
			return myCommands.indexOf(platformObject.schema.getAPIName()) > -1;
		}
		else {
			return false;
		}
	},
	executeMyCommand: function (inObject, outObject, platformObject) {
		var commandName = platformObject.schema.getAPIName();
		switch (commandName) {
			case "RollbackTX":
				return handler.rollbackTX(inObject, outObject, platformObject);
				break;
		}
	},
	rollbackTX: function (inObject, outObject, platform) {
		var def = Def.Deferred();
		dataservice.getTXRequest(inObject["p_TXID"]).then(function (txRow) {
			var apiID = txRow['v_APIID'];
			var rollbackAPISchemaObject = schema.getSchemaByAPIID(apiID)
			var bIfUndoApi = true;
			var undoAPIName = schema.getUndoAPIName(rollbackAPISchemaObject);
			var translationMap = schema.getUndoTranslationMap(rollbackAPISchemaObject);
			if (!undoAPIName) {
				bIfUndoApi = false;
				undoAPIName = schema.getSetRecordStateAPIName(rollbackAPISchemaObject);
				translationMap = schema.getSetRecordStateTranslationMap(rollbackAPISchemaObject);
				console.log("[debug] Found Set record API Name " + undoAPIName);
			}
			else {
				console.log("[debug] Found Undo API Name :" + undoAPIName);
			}

			if (undoAPIName) {
				var dummyOutObject = {};
				try {

					if (!translationMap.response && !translationMap.previous) {
						if (bIfUndoApi) {
							dummyOutObject = mapp(JSON.parse(txRow.v_ResponseData), dummyOutObject, translationMap);
						}
						else {
							dummyOutObject = mapp(JSON.parse(txRow.v_PreviousState), dummyOutObject, translationMap);
						}
					}
					else {

						if (txRow.v_PreviousState && translationMap.previous) {
							dummyOutObject = mapp(JSON.parse(txRow.v_PreviousState), dummyOutObject, translationMap.previous);
						}
						if (txRow.v_ResponseData && translationMap.response) {
							dummyOutObject = mapp(JSON.parse(txRow.v_ResponseData), dummyOutObject, translationMap.response);
						}
					}
				} catch (e) {
					def.reject("Unable to parse previous result" + e.message);
					return;
				}
				var platHandler = PlatformHandler();
				platHandler.execute(
					undoAPIName,
					dummyOutObject,
					{},
					platform
					).done(function (result) {
						delete result.result.resultCode;
						def.resolve(result.result);
					}).fail(function (error) {
						def.reject(error);
					});
			}
			else {
				def.resolve({ resultCode: "Success" });
				//def.reject("Neither Undo API nor Set Record State API is populated for apiid : " + apiID);
			}
		}, function (err) {
			platform.next = false;
			def.reject("no TX found for rollback");
		});		
		return def;
	}
};



module.exports = handler;