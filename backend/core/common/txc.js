var config = require('../appConfig.js');
var error = require('./error.js');
//var mysql = require('mysql');
var net = require('net');
var Def = require("jquery-deferred");
//var queryProvider = require('./queryProviderMySQL.js');
var freeSocketsPool = [];
var schema = require('./schema.js');


var pool = {
	createPool: function (options) {
		var deferred = Def.Deferred();

		for (var i = 0; i < config.txc.pool; i++) {
			freeSocketsPool.push(net.connect({ port: config.txc.port, host: config.txc.host }, function () {
				console.log("socket connected" + i);
			}));
		}
		deferred.resolve(freeSocketsPool);
		return deferred.promise();
	}
};
var poolUtil = {
	getConnectionFromPool: function () {
		var deferred = Def.Deferred();
		try {
			var sock = freeSocketsPool.shift();
			if (sock) {
				deferred.resolve(sock);
			}
			else {
				deferred.reject();
			}
			return deferred;
		} catch (e) {
			deferred.reject(new error(e));
		}
	}
};
var connectionUtil ={
	executeQuery: function (sqlQuery, isDirect) {


		var deferred = Def.Deferred();
		try {
			if (this) {
				console.info("[query] -> " + sqlQuery);
				if (sqlQuery.indexOf('Call ') == -1) {
					var errorObject = error.executeQueryError(err);
					return deferred.reject(errorObject);
				}
				var rawQ = sqlQuery.replace('Call ', '')
				var items = rawQ.split('(');
				var procName = items[0].trim();
				var inputValues = rawQ.substring(rawQ.indexOf('(') + 1, rawQ.indexOf(')')).split(',');
				var inParamsList = schema.getParameters(procName);
				var dataObject = {};
				for (var i = 0; i < inParamsList.length; i++) {
					if (inParamsList[i].direction == "in") {
						dataObject[inParamsList[i].name] = inputValues[i];
					}
					else {
						dataObject[inputValues[i]] = null;
					}
				}
				var socketObject = {
					"DataAccess": {
						"StoredProc": procName,
						"DBId": "",
						"RequestTimeout": 60,
						"Params": dataObject
					}
				};
				var json = JSON.stringify(socketObject);
				var sock = this;
				
				this.write(json.length.toString() +" "+ json);
				this.on('data', function (response) {
					if (isDirect) {
						console.info("[query] result <- " + JSON.stringify(response));
						return deferred.resolve(response);
					}
					else {
						var result1 = queryProvider.normalizedResult(response);
						//console.log(JSON.stringify(result1));
						console.info("[query] result <- " + JSON.stringify(result1));
						freeSocketsPool.push(sock);
						deferred.resolve(result1);
					}
				});
				this.on('error', function (err) {
					if (err) {
						if (err.message) {
							console.error("[query] error <- " + err.message);
						}
						else {
							try {
								console.error("[query] error <- " + JSON.stringify(err));
							} catch (e) {
								console.error("[query] error <- " + err);
							}
						}
						var errorObject = error.executeQueryError(err);
						deferred.reject(errorObject);
						return;
					}
					freeSocketsPool.push(sock);
				});
			} else {
				deferred.reject(error.connectionNotAvailable("Execute Query has no valid connection"));
			}
		} catch (e) {
			deferred.reject(new error(e));
		}
		return deferred.promise();
	},
	releaseConnectiontoPool: function () {
	},
	closeConnection: function () {
		
	}
}
var transactionsUtil = {
	begintransaction: function () {
		
	},
	committransaction: function () {
		
	},
	rollbacktransaction: function () {
		
	}
}
var Class = {
	cons: function () {
		return {
			pool: pool,
			poolUtil: poolUtil,
			connectionUtil: connectionUtil,
			transactionsUtil: transactionsUtil
		};
	}
}
module.exports = Class.cons();

//Adapter.prototype.close = function () {
//    if (this._dbClient) {
//        this._dbClient.end();
//    }
//};

//function getObjectValue(obj, prop) {
//	if (prop.PlatformHeaderParamName != null) {
//		var value = getDescendantProp(obj.session, prop.PlatformHeaderParamName);
//		return value;
//	}
//	var propName = prop.name;
//    if (obj == null) {
//        return null;
//    }
//    if (obj[propName] != null) {
//        return obj[propName];
//    }
//    if (typeof (obj) == "object") {
//        for (var i in obj) {
//            if (obj.hasOwnProperty(i) && typeof(obj[i]) =="object") {
//            	var result = getObjectValue(obj[i], prop);
//                if (result != null) {
//                    return result;
//                }
//            }
//        }
//    }
    
//    return null;
//}



////util.inherits(Adapter, dbAbstract);
//module.exports = Adapter;


////# sourceURL=mysql.js