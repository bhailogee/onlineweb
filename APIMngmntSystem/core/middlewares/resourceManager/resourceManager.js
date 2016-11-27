
var PlatformHandler = require('../../common/PlatformHandler.js');
var dataservice = require('../../common/dataservice.js');
var Def = require("jquery-deferred");
var mapp = require('../../common/mapper.js');
var resourceHandler = require('./resourceManagerHandler.js');
//var config = require('config');
function resourcemanager(inObject, outObject, platform) {
	var def = Def.Deferred();
	//if (resourceHandler.isMyCommand(inObject, outObject, platform)) {
	//	console.log("[debug] Resource Manager found its command " + platform.schema.getAPIName());
	//	resourceHandler.executeMyCommand(inObject, outObject, platform).then(function (result) {
	//		platform.next = false;
	//		def.resolve({ inObject: inObject, outObject: result, platformObject: platform });
	//	});
	//}
	if (false)
	{ }
	else {
		var internalDef = Def.Deferred();
		if (platform.schema.getPreviousStateAPIName()) {
			console.log("Found Previous State API Name " + platform.schema.getPreviousStateAPIName());
			var platHandler = PlatformHandler();
			platHandler.execute(
				platform.schema.getPreviousStateAPIName(),
				mapp(inObject, platform.schema.getPreviousStateTranslationMap()),
				{},
				platform
				).done(function (result) {
					delete result.result.resultCode;
					internalDef.resolve(result.result);
				}).fail(function (error) {
					internalDef.reject(error);
				});
		} else {
			internalDef.resolve(null);
		}

		internalDef.done(function (previousState) {
			dataservice.addTXRequest(platform.schema.getGlobalAPIName(), platform.session.getGlobalTransactionID(), platform.session.getClientRequestID(), JSON.stringify(previousState), 1, JSON.stringify(inObject), platform.session.getServerParam("sessionState.v_AdministratorID")).done(function (result) {
				if (result.v_ReturnCode == 0) {
					console.log("[debug] Request Logged in resource manager :" + result.v_TXID);
					inObject["v_TXID"] = result.v_TXID;
					platform.session.setTXID(result.v_TXID);

					def.resolve(outObject);
				}
				else {
					console.error("[debug] Request was nont Logged in resource manager return code : " + result.v_ReturnCode);
					def.reject(new Error("Error in saving TX Request in API Manager with return code" + result.v_ReturnCode));
					platform.next = false;
					return;
				}
			}).fail(function (err) {
				def.reject(err);
				platform.next = false;
				return;
			});
		}).fail(function (err) {
			console.error("[debug] Unable to get previous state of API in resource manager");
			def.reject(new Error("Error in getting previous state of API"));
			platform.next = false;
			return;
		});
	}
	return def;
}

function postprocess(inObject, outObject, platform) {
	var def = Def.Deferred();
	var successIdentification = resourceHandler.identifySuccess(inObject, outObject, platform);
	outObject.resultCode = successIdentification.result;

	//if (outObject.v_ReturnCode == 0) {
	//	outObject.resultCode = "Success";
	//} else {
	//	outObject.resultCode = "Failure";
	//};

	//inObject["v_TXID"]
	
	var txid = platform.session.getTXID() || inObject["v_TXID"];

	dataservice.modifyTXResponse(txid, JSON.stringify(outObject), successIdentification.returnParam, (successIdentification.result == "Success" ? "SUCCESS" : "ERROR"), "").done(function (result) {
		if (result.v_ReturnCode == 0) {
			def.resolve(outObject);
		} else {
			def.reject(new Error("Error in modifying TX Response in API Manager"));
			return;
		}
	}).fail(function (err) {
		def.reject(err);
	});
	return def;
}

var cons = {
	init: function () {
		resourcemanager.postprocess = postprocess;
		return resourcemanager;
	}
};

module.exports = cons.init();