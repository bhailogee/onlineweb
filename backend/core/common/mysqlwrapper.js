var error = require('./error.js');
var mysql = require('mysql');
var Def = require("jquery-deferred");
var queryProvider = require('./queryProviderMySQL.js');
var fs = require('fs');

var pool = {
	createPool: function (options) {
		var deferred = Def.Deferred();

		var _dbPool = mysql.createPool(options);
		_dbPool.on('connection', function (connection) {
			//console.log("New Connection is made");
		});
		_dbPool.on('enqueue', function () {
			console.log('Waiting for available connection slot');
		});
		deferred.resolve(_dbPool);
		return deferred.promise();
	}
};
var poolUtil = {
	getConnectionFromPool: function () {
		var deferred = Def.Deferred();
		try {						
			this.getConnection(function (err, connection) {
				if (err) {					
					deferred.reject(error.getPoolConnectionFailure(err));
				} else {					
					deferred.resolve(connection);
				}
			});
			return deferred;
		} catch (e) {
			deferred.reject(new error(e));
		}
	}
};
var connectionUtil ={
	executeQuery : function (sqlQuery,isDirect) {
		var deferred = Def.Deferred();
		try {
			if (this) {
				console.info("[query] -> " + sqlQuery);
				this.query(sqlQuery, function (err, response, fields) {
					debugger;
					fs.appendFile('log.txt', JSON.stringify(response) + '\n' + '\n' + '\n', function (err) {
						if (err) throw err;
						console.log('It\'s saved!');
					});
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
					if (isDirect) {
						console.info("[query] result <- " + JSON.stringify(response));
						return deferred.resolve(response);						
					}
					else{
						var result1 = queryProvider.normalizedResult(response);
						//console.log(JSON.stringify(result1));

						console.info("[query] result <- " + JSON.stringify(result1));
						deferred.resolve(result1);
					}
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
		if (this.release) {
			this.release();
		}
	},
	closeConnection: function () {
		if (this.end) {
			this.end();
		}
	}
}
var transactionsUtil = {
	begintransaction: function () {
		try {
			var deferred = Def.Deferred();
			if (this) {
				this.beginTransaction(function (err) {
					if (err) {
						deferred.reject(error.beginTransactionFailure(err));
					}
					deferred.resolve(this);
				});
			}
			else {
				deferred.reject(error.connectionNotAvailable("Begin Transaction has no connection."));
			}
		} catch (e) {
			deferred.reject(new error(e));
		}
	},
	committransaction: function () {
		var deferred = Def.Deferred();
		if (this.commit) {
			this.commit(function (err) {
				if (err) {
					this.rollbacktransaction().done(function () {
						deferred.reject(error.commitError(err));
					});
				}
				deferred.resolve(true);
			});
		}
		return deferred.promise();
	},
	rollbacktransaction: function () {
		var deferred = Def.Deferred();
		if (this.rollback) {
			this.rollback(function () {
				deferred.resolve(true);
			});
		}
		return deferred.promise();
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