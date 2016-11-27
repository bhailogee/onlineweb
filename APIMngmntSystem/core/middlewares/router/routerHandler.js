//var fs = require('fs');
var Def = require("jquery-deferred");
//var securityConfig = JSON.parse(fs.readFileSync('./core/middlewares/security/securityConfig.json', 'utf8'));
//var store = require('../../common/store.js');
//var schema = require('../../common/schema.js');
var dataservice = require("../../common/dataservice.js");
//var securityModel = require('./models/base.js');
var PlatformHandler = require('../../common/PlatformHandler.js');

var myCommands = ["RollbackClientRequest"];
var handler = {
	workflowSpecific: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		handler.setClientRequestID(inObject, outObject, platformObject).then(function () {
			def.resolve(outObject);
		}, function (err) {
			def.reject(err);
		});
		return def.promise();
	},
	setClientRequestID: function (inObject, outObject, platformObject) {
		if (!platformObject.session.getClientRequestID()) {
			var v_PortalID = platformObject.session.getServerParam("clientState.portalID");
			var v_APIID = platformObject.schema.getGlobalAPIName();
			var v_ClientRequestPayload = JSON.stringify(inObject);
			var v_AdminID = platformObject.session.getServerParam("sessionState.v_AdministratorID");
			//var v_TXID = inObject["v_TXID"];
			var v_IsNestedTransaction = null;
			return dataservice.executeByAPI("TX_AddClientReqByGlobalAPIName", [v_PortalID, v_APIID, v_ClientRequestPayload, v_AdminID, v_IsNestedTransaction], ["v_ClientRequestID", "v_ReturnCode"]).then(function (result) {
				if (result) {
					platformObject.session.setClientRequestID(result.v_ClientRequestID);
				}
			}, function (err) {
				console.error("[debug] Unable to add client request id:" + (err.message || '') + (err.toString() || '') + (err.code || ''));
				return null;
			});
		}
		else {
			var def = Def.Deferred();
			def.resolve(outObject);
			return def.promise();
		}
	},
	markClientRequestID: function (inObject, outObject, platformObject) {
		var clientReqID = platformObject.session.getClientRequestID();
		return dataservice.executeByAPI("TX_MrkClientRequestResponse", [clientReqID, JSON.stringify(outObject), outObject.resultCode], ["v_ReturnCode"]);
	},
	isMyCommands: function (inObject, outObject, platformObject) {
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
			case "RollbackClientRequest":
				return handler.rollbackClientRequest(inObject, outObject, platformObject);
				break;
		}
	},
	rollbackClientRequest: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		var clientRequestID = inObject["v_ClientRequestID"];

		dataservice.getAllGlobalTrnsactionsByClientRequestID(clientRequestID).done(function (results) {
			handler.rollbackRecursive(results.rows, platformObject).done(function (result) {
				def.resolve(result);
			}).fail(function (error) {
				def.reject(error);
			})
		});
		return def.promise();
	},
	rollbackRecursive: function (gtxs, platformObject,_def) {
		var def = _def || Def.Deferred();
		if (gtxs.length > 0) {
			var gtx = gtxs.shift();

			var platHandler = PlatformHandler();
			platHandler.execute(
				"__RollbackGlobalTransaction",
				{ 'p_GlobalRequestID': gtx['v_GlobalTransactionID'] },
				{},
				platformObject
				).done(function (result) {
					//delete result.result.resultCode;
					//def.resolve(result.result);
					handler.rollbackRecursive(gtxs, platformObject, def);
				}).fail(function (error) {
					def.reject(error);
				});
		} else {
			def.resolve({});
		}
		return _def || def.promise();
	}
};



module.exports = handler;