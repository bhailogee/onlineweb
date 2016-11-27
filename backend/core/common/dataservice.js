var extend = require('extend');
var Def = require("jquery-deferred");
//var store = require('./store');
var mysqlConnection = require('./mysqlwrapper');
var connectClass = require('./connection');
var utility = require('./utility');
var constant = require('./constants');
var config = require("../appConfig.js");

var local = {};

//(connectionOptions).done(function(_pool){
//	dbPool = extend(true, _pool, connection.poolUtil);
//});

function constructor(_connection) {
	var connection = connectClass(_connection || mysqlConnection);
	var connectionOptions = connection.pool.optionsFromConfiguration();

	var dataservice = {
		getApplicationsList: function () {
			var query = connection.queryProvider.getQueryString("LS_applications", [], ["v_ID"]);
			return exec(query);
			//var applicationsList = utility.appSession(constant.applicationsList);
			//if (applicationsList) {
			//	var deferred = Def.Deferred();
			//	deferred.resolve(applicationsList);
			//	return deferred.promise();
			//}
			//else {
			//var query = "Select * from tblapplications;";
			//return dataservice.exec(query,true).then(function (result) {
			//	utility.appSession(constant.applicationsList, result);
			//	return result;
			//});
			//}
		},
		getApplicationConnectors: function () {
			//var applicationsList = utility.appSession(constant.applicationConnectors);
			//if (applicationsList) {
			//	var deferred = Def.Deferred();
			//	deferred.resolve(applicationsList);
			//	return deferred.promise();
			//}
			//else {
			//var query = "Select * from tblapiconnectors";
			//return dataservice.exec(query,true).then(function (result) {
			//	utility.appSession(constant.applicationConnectors, result);
			//	return result;
			//});
			//}
			var query = connection.queryProvider.getQueryString("LS_apiconnectors", [], ["v_ID"]);
			return exec(query);

		},
		getAPIAuthorisation: function (v_AdministratorID, v_PortalID, v_CompletePath, v_HttpMethod) {
			var query = connection.queryProvider.getQueryString("TX_AuthorizeRequest", [v_AdministratorID, v_PortalID, v_CompletePath, v_HttpMethod], ["v_ReturnCode"]);
			return exec(query);
		},
		getReturnCodeDescription: function (v_AdminLocaleData, v_ErrorCode) {
			var query = connection.queryProvider.getQueryString("TX_GetErrorDescriptionByCode", [v_ErrorCode, v_AdminLocaleData], ["v_ErrorDescription", "v_ReturnCode"]);
			return exec(query);
		},
		startGlobalTrans: function (v_ClientRequestID, v_AdminID) {
			//TX_StartGlobalTransaction
		},
		endGlobalTrans: function (v_GlobalTransactionID, v_TransactionResult, v_AdminID) {
			//TX_EndGlobalTransaction
		},
		markClientRequestResponse: function (v_ClientRequestID, v_ClientResponsePayload, v_ClientRequestResult, v_AdminID, v_TXID, v_IsNestedTransaction) {
			//TX_MrkClientRequestResponse
		},
		addClientRequest: function (v_PortalID, v_APIID, v_ClientRequestPayload, v_AdminID, v_TXID, v_IsNestedTransaction) {
			//TX_AddClientRequest
		},
		markSessionEndTime: function (v_LoginSessionKey, v_IsSessionExpired, v_AdminSessionLastAccessed, v_AdminSessionAttributes, v_AdminID, v_TXID, v_IsNestedTransaction) {
			//TX_MrkAdminSessionEndTime
		},
		authenticateAdminByPassword: function (v_UserName, v_Password, v_RemoteIP, v_PortalID, v_AdminID, v_TXID, v_IsNestedTransaction) {
			//TX_AuthenticateAdminByPassword
			var query = connection.queryProvider.getQueryString("TX_AuthenticateAdminByPassword", [v_UserName, v_Password, v_RemoteIP, v_PortalID, v_AdminID, v_TXID, v_IsNestedTransaction],
				[
					'v_AdministratorID',
					'v_AgentID',
					'v_DealerID',
					'v_MenuData',
					'v_PersonalizationData',
					'v_AdministratorSessionID',
					'v_LoginSessionKey',
					'v_ReturnCode'
				]);
			return exec(query);
		},
		addTXRequest: function (v_APIID, v_GlobalTransactionID, v_ClientRequestID, v_PreviousState, v_NestingLevel, v_RequestData, v_AdminID) {
			//TX_AddTX
			var query = connection.queryProvider.getQueryString("TX_AddTXByGlobalAPIName", [v_APIID, v_GlobalTransactionID, v_ClientRequestID, v_PreviousState, v_NestingLevel, v_RequestData, v_AdminID], ["v_TXID", "v_ReturnCode"]);
			return exec(query);
		},
		getTXRequest: function (txid, platform) {

			var query = connection.queryProvider.getQueryString("UI_tx", [txid], ['v_ID', 'v_APIID', 'v_GlobalTransactionID', 'v_ClientRequestID', 'v_PreviousState', 'v_RequestTimeStamp', 'v_NestingLevel', 'v_RequestData', 'v_ResponseData', 'v_ReturnCodeOut', 'v_TxExitStatus', 'v_ResponseTimeStamp', 'v_NewState', 'v_TransactionEndStatus', 'v_TransactionEndTimeStamp']);
			return exec(query);
		},
		getAllGlobalTrnsactionsByClientRequestID: function (v_ClientRequestID) {
			var query = connection.queryProvider.getQueryString("GU_GetTransByClientRequest", [v_ClientRequestID], ['v_ID']);
			return exec(query);
		},
		getAllTXByGlobalTransactionID: function (v_GlobalTransactionID) {
			var query = connection.queryProvider.getQueryString("GU_GetTXByGlobalTransaction", [v_GlobalTransactionID], ['v_ID']);
			return exec(query);
		},
		getESBData: function (eventID) {
			var query = connection.queryProvider.getQueryString("eventtypeinterestedapis_f1", [eventID], ['v_ID']);
			return exec(query);
		},
		getHangedSessionsData: function () {
			var query = connection.queryProvider.getQueryString("Job_PurgeHangedSessions", [], ['v_ID']);
			return exec(query);
		},
		getesbSessionsData: function () {
			var query = connection.queryProvider.getQueryString("Job_PurgeHangedSessions", [], ['v_ID']);
			return exec(query);
		},

		/*
		*v_TxExitStatus ENUM('SUCCESS', 'PARTIAL_SUCCESS', 'PARTIAL_FAILURE', 'ERROR')
		*/
		modifyTXResponse: function (v_TXID, v_ResponseData, v_ReturnCodeOut, v_TxExitStatus, v_NewState) {
			//TX_ModifyTXResponse
			var query = connection.queryProvider.getQueryString("TX_ModifyTXResponse", [v_TXID, v_ResponseData, v_ReturnCodeOut, v_TxExitStatus, v_NewState], ["v_ReturnCode"]);
			return exec(query);
		},
		executeByAPI: function (apiName, inParams, outParams) {
			var query = connection.queryProvider.getQueryString(apiName, inParams, outParams);
			return exec(query);
		},
		execute: function (inObject, outObject, platformObject) {
			var methodName = platformObject.schema.getAPIName();
			var inParams = platformObject.schema.resolveInput(inObject);

		},
		executeByQuery: function (query, inObject, plaformObject) {
			debugger;
			var query = connection.queryProvider.format(query, inObject);
			console.log(query);
			return exec(query, false, plaformObject);
		}
	};

	function exec(query, isDirect, plaformObject) {
		var deferred = Def.Deferred();
		var transactionID = null;
		if (plaformObject)
			transactionID = plaformObject.session.getGlobalTransactionID();
		if (!transactionID) {
			dbPool.getConnectionFromPool().done(function (_connection) {
				connection.connectionUtil.executeQuery.call(_connection, query, isDirect).done(function (result) {
					deferred.resolve(result);
				}).fail(function (err) {
					deferred.reject(err);
				}).always(function () {
					_connection.releaseConnectiontoPool();
				});
			}).fail(function (err) {
				deferred.reject(err);
			});
			return deferred.promise();
		} else {

			//var _connection = plaformObject.getTransactionConnection();
			var _connection = connection.names.getConnection(plaformObject.session.getGlobalTransactionID());
			if (!_connection) {
				dbPoolTransactional.getConnectionFromPool().done(function (_connection) {
					//plaformObject.setTransactionConnection(_connection);
					connection.names.addConnection(plaformObject.session.getGlobalTransactionID(), _connection);
					connection.connectionUtil.executeQuery.call(_connection, query, isDirect).done(function (result) {
						deferred.resolve(result);
					}).fail(function (err) {
						deferred.reject(err);
					});
				});
			} else {
				connection.connectionUtil.executeQuery.call(_connection, query, isDirect).done(function (result) {
					deferred.resolve(result);
				}).fail(function (err) {
					deferred.reject(err);
				});
			}
			return deferred.promise();
		}
	};

	var syncFunction = utility.YFunction(connectionOptions, connection.pool.createPoolInstance, connection.pool);
	var dbPool = {};
	syncFunction.next().value.done(function (result) {
		dbPool = result;
	});


	var transactionConfig = config.connectionTransaction;
	var syncFunction2 = utility.YFunction(transactionConfig, connection.pool.createPoolInstance, connection.pool);
	var dbPoolTransactional = {};
	syncFunction2.next().value.done(function (result) {
		dbPoolTransactional = result;
	});

	connection.names = {
		connectionNamespace: {},
		addConnection: function (transactionID, _connection) {
			if (transactionID) {
				connection.names.connectionNamespace[transactionID] = _connection;
			}
		},
		getConnection: function (transactionID) {
			return connection.names.connectionNamespace[transactionID];
		},
		removeConnection: function (transactionID) {
			var conenction = connection.names.connectionNamespace[transactionID];
			try {
				connection.connectionUtil.releaseConnectiontoPool.call(conenction);
			}
			catch (e) {
			}
			connection.names.connectionNamespace[transactionID] = null;
			delete connection.names.connectionNamespace[transactionID];
		}
	};


	dataservice.exec = exec;
	dataservice.connection = connection;
	return dataservice;
}

//var syncFunction2 = utility.YFunction({}, dataservice.getApplicationsList, this);
//syncFunction2.next().value.done(function (result) {
//	//do nothing only wait;
//	local.applicationsList = result;
//});

//var syncFunction3 = utility.YFunction({}, dataservice.getApplicationConnectors, this);
//syncFunction3.next().value.done(function (result) {
//	//do nothing only wait;	
//});
var exportObject = constructor();
exportObject.constructor = constructor;
module.exports = exportObject;


