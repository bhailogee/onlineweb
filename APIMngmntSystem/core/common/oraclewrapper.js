var error = require('./error.js');
var oracledb = require('oracledb');
var Def = require("jquery-deferred");


var pool = {	
	createPool: function (options) {
		var deferred = Def.Deferred();
		var _dbPool = oracledb.createPool(options, function (err, pool) {
			if (err) {
				deferred.reject(err);
				return;
			} else {
				deferred.resolve(pool);
			}
		});				
		return deferred.promise();
	}
};
var poolUtil = {
	getConnectionFromPool: function () {
		var deferred = Def.Deferred();
		try {						
			this.getConnection(function (err, connection) {
				if (err) {					
					deferred.reject(new error.getPoolConnectionFailure(err));
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
	executeQuery : function (sqlQuery) {
		var deferred = Def.Deferred();
		try {
			if (this) {
				this.execute(sqlQuery, function (err, response) {
					if (err) {
						deferred.reject(error.executeQueryError(err));
					}
					deferred.resolve({ response: response });
				});
			} else {
				deferred.reject(new error.connectionNotAvailable("Execute Query has no valid connection"));
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
						deferred.reject(new error.beginTransactionFailure(err));
					}
					deferred.resolve(this);
				});
			}
			else {
				deferred.reject(new error.connectionNotAvailable("Begin Transaction has no connection."));
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
//Adapter.prototype.
//Adapter.prototype.execute = function (sql, params, callback) {
//    var self = this;    
//    var s = oracledb.getQuery(sql, params);
//    return this.executeQuery(s);
//};

//var oracledb = {
//    schema: {},
//    init: function (_schema) {
//        this.schema = _schema;
//    },
//    getQuery: function (sql, params) {

//        var s = sql.trim();
//        if (s.toLowerCase().indexOf('call ') !== 0) {
//            s = "Call " + sql;
//        }

//        var normalized = this.normalize.call(this, sql, params);
//        if (normalized) {
//            s += "(" + normalized.result + ");";
//            if (normalized.outSelect != null || normalized.outSelect.trim().length > 0) {
//                s += normalized.outSelect + ";";
//            }
//        }
//        return s;
//    },
//    normalizedError: function (err) {
//        return err;
//    },

//    normalizedResult: function (data) {
//        var result = Object.create(data);
//        //debugger;
//        //console.log(JSON.stringify(data));
//        //result.status = {};
//        //result.status.message = "Success";
//        //result.status.code = 1;
//        //console.log(JSON.stringify(data));
//        result.data = {};
//        if (data.length > 1) {
//            if (Array.isArray(data[0])) {
//                result.data.rows = data[0];
//            }

//            if (data.length > 1) {
//                var dataRows = data[2] || data[1]; // This one is to tackle cases if procedure has an out as well as multiple rows output as select.
//                for (var row = 0; row < dataRows.length; row++) {
//                    var aRow = dataRows[row];
//                    for (var column in aRow) {
//                        result.data[column.substring(1, column.length)] = aRow[column];
//                    }
//                }
//            }

//        }
//        return result.data;
//    },
//    outParamsQuery: function (name, args) {
//        var _params = schema.getParameters(name);
//        var result = "";
//        foreach(prop in _params)
//        {
//            if (prop["direction"] != null && prop["direction"].toLowerCase() != "in") {
//                if (result.length > 0) {
//                    result += ",";
//                }
//                result += "@" + prop.name;
//            }
//        }
//        return result;
//    },
//    normalize: function (name, args) {
//        var _params = this.schema.getParameters(name);
//        var result = "";
//        var outSelect = "";



//        for (var i = 0; _params && i < _params.length; i++) {
//            var prop = _params[i];

//            if (result.length > 0) {
//                result += ",";
//            }

//            if (prop.direction == "in") {
//                //                if (args[prop.name] != null) {
//                //                    result += "'" + args[prop.name].toString().replace(/'/g, "\\'") + "'";
//                //                } else if (args.body && args.body[prop.name] != null){
//                //                    result += "'" + args.body[prop.name].toString().replace(/'/g, "\\'") + "'";
//                //                } else if (args.session && args.session.auth && args.session.auth[prop.name] != null){
//                //                    result += "'" + args.session.auth[prop.name].toString().replace(/'/g, "\\'") + "'";
//                //                } else {
//                //                    if (prop["default"] != null) {
//                //                        result += "'" + prop["default"] + "'";
//                //                    }
//                //                    else {
//                //                        result += "null";
//                //                    }
//                //                }
//                var _localResult = getObjectValue(args, prop);
//                if (_localResult != null) {
//                    result += "'" + _localResult.toString().replace(/'/g, "\\'") + "'";
//                }
//                else {
//                    if (prop["default"] != null) {
//                        result += "'" + prop["default"] + "'";
//                    }
//                    else {
//                        result += "null";
//                    }
//                }
//            }
//            else {
//                result += "@" + prop.name;

//                if (outSelect.length > 0) {
//                    outSelect += ",";
//                }
//                else {
//                    outSelect = "Select ";
//                }
//                outSelect += "@" + prop.name;
//                hasOutParams = true;
//            }

//        }
//        return { result: result, outSelect: outSelect };
//    }
//}
//function getDescendantProp(obj, desc) {
//	var arr = desc.split(".");
//	while (arr.length && (obj = obj[arr.shift()]));
//	return obj;
//}
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


////# sourceURL=oracledb.js