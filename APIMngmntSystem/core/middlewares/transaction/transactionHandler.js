/// <reference path="" />
//var connection = require('../../common/connection.js');
var transactionModel = require('./models/base.js');
//var internalConnectionsPool = {};
var Def = require("jquery-deferred");
var transactionDataservice = require("./transactionDataservice");
var dataservice = require("../../common/dataservice.js");
//var connectionPool;
var PlatformHandler = require('../../common/PlatformHandler.js')

var myCommands = [
	"Begin",
	"Commit",
	"Rollback",
	"RollbackGlobalTransaction"
]

var handler = {
	inTransaction: function (inObject, outObject, platformObject) {
		var key = platformObject.session.getGlobalTransactionID();
		if (key) {
			return true;
		}
		else {
			return false;
		}
	},
	isMyCommands: function (inObject, outObject, platformObject) {
		var appName = platformObject.schema.getApplicationID();
		if (appName == "1") {
			return myCommands.indexOf(platformObject.schema.getAPIName()) > -1;
		}
		else {
			return false;
		}
	},
	executeMyCommand: function (inObject, outObject, platformObject) {
		var commandName = platformObject.schema.getAPIName();
		switch (commandName) {
			case "Begin":
				return handler.beginTrans(inObject, outObject, platformObject);
				break;
			case "Commit":
				var connection = dataservice.connection.names.getConnection(platformObject.session.getGlobalTransactionID());
				connection.releaseConnectiontoPool();
				dataservice.connection.names.removeConnection(platformObject.session.getGlobalTransactionID());
				platformObject.session.resetGlobalTransactionID();
				return handler.commitTrans(inObject, outObject, platformObject);
				break;
			case "Rollback":
				var connection = dataservice.connection.names.getConnection(platformObject.session.getGlobalTransactionID());
				connection.rollbacktransaction();
				connection.releaseConnectiontoPool();
				dataservice.connection.names.removeConnection(platformObject.session.getGlobalTransactionID());
				platformObject.session.resetGlobalTransactionID();
				return handler.rollbackTrans(inObject, outObject, platformObject);
				break;
			case "RollbackGlobalTransaction":
				return handler.rollbackGlobalRequestID(inObject,outObject,platformObject);
				break;

		}
	},
	executeInTransaction: function (inObject, outObject, platformObject) {
		//var deferred = Def.Deferred();
		
		//var connection = tranObj.getLinkedConnection();
		//handler.execute(_connection, inObject).done(function (results) {
		//	deferred.resolve(results);
		//}).fail(function (err) {
		//	deferred.reject(err);
		//});
		//return deferred;
	},
	executeOnly: function (inObject, outObject, platformObject) {
		var tranObject = this.inTransaction(inObject, outObject, platformObject);
		tranObject.attachWithApplication(platformObject.getApplicationName());

		//var deferred = Def.Deferred();
		//connectionPool.getConnectionFromPool().done(function (_connection) {
		//	handler.execute(_connection, inObject).done(function (results) {
		//		deferred.resolve(results);
		//	}).fail(function (err) {
		//		deferred.reject(err);
		//	});
		//}).fail(function (err) {
		//	deferred.reject(err);
		//});
		//return deferred;
	},
	//execute: function (connection, inObject) {
	//	return connection.executeFunction(inObject.getAPIName(), inObject.getPayLoad());
	//},
	beginTrans: function (inObject, outObject, platformObject) {
		return transactionDataservice.startGlobalTransaction(inObject, outObject, platformObject).then(function (results) {
			//var tranModel = transactionModel();
			//tranModel.setKey(results.v_GlobalTransactionID);
			//platformObject.setTransactionObject(tranModel);
			platformObject.session.setGlobalTransactionID(results.v_GlobalTransactionID);
			return results.v_GlobalTransactionID;
		});
	},
	commitTrans: function (inObject, outObject, platformObject) {
		return transactionDataservice.endGlobalTransaction(inObject, outObject, platformObject).then(function (results) {
			return true;
		});
	},
	rollbackTrans: function (inObject, outObject, platformObject) {
		return transactionDataservice.rollbackGlobalTransaction(inObject, outObject, platformObject).then(function (results) {
			return true;
		});
	},
	rollbackGlobalRequestID: function (inObject, outObject, platformObject) {
		var def = Def.Deferred();
		var globalReq = inObject["p_GlobalRequestID"];
		dataservice.getAllTXByGlobalTransactionID(globalReq).done(function (results) {
			handler.rollbackRecursive(results.rows, platformObject).done(function (result) {
				def.resolve(result);
			}).fail(function (error) {
				def.reject(error);
			})
		});
		return def.promise();
	},
	rollbackRecursive: function (txids, platformObject, _def) {
		var def = _def || Def.Deferred();
		if (txids.length > 0) {
			var txid = txids.pop();

			var platHandler = PlatformHandler();
			platHandler.execute(
				"__RollbackTX",
				{ 'p_TXID': txid['v_TXID'] },
				{},
				platformObject
				).done(function (result) {
					//delete result.result.resultCode;
					//def.resolve(result.result);
					handler.rollbackRecursive(txids, platformObject, def);
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