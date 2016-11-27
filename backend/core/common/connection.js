var error = require('./error.js');
var queryProvider = require('./queryProviderMySQL');
var appConfig = require('../appConfig.js');
var Def = require("jquery-deferred");
var extend = require('extend');


function constructor(connection) {
	var pool = {
		createPoolInstance: function (options) {
			var deferred = Def.Deferred();
			options = options || this.optionsFromConfiguration();
			this.createPool(options).done(function (pool) {
				deferred.resolve(pool);
			}).fail(function (err) {
				deferred.reject(err);
			});
			return deferred.promise();
		},
		createPool: function (options) {
			var deferred = Def.Deferred();
			var _dbPool = connection.pool.createPool.call(this, options).done(function (pool) {
				pool = extend(true, pool, poolUtil);
				deferred.resolve(pool);
			}).fail(function (err) {
				deferred.reject(err);
			});
			return deferred.promise();
		},
		optionsFromConfiguration: function () {
			return {
				host: appConfig.connection.host,
				user: appConfig.connection.user,
				password: appConfig.connection.password,
				port: appConfig.connection.port,
				database: appConfig.connection.database,
				connectionLimit: appConfig.connection.connectionLimit || 100,
				multipleStatements: appConfig.connection.multipleStatements || true,
				acquireTimeout: appConfig.connection.acquireTimeout || 120000,
				waitForConnections: appConfig.connection.waitForConnections || true,
				queueLimit: appConfig.connection.queueLimit || 0
			};
		}
	};
	var poolUtil = {
		getConnectionFromPool: function () {
			var deferred = Def.Deferred();
			try {
				connection.poolUtil.getConnectionFromPool.call(this).done(function (_connection) {
					_connection = extend(true, _connection, connectionUtil);
					_connection = extend(true, _connection, transactionsUtil);
					deferred.resolve(_connection);

				}).fail(function (err) {
					deferred.reject(error.getPoolConnectionFailure(err));
				});
				return deferred;
			} catch (e) {
				deferred.reject(new error(e));
			}
		}
	};
	var connectionUtil = {
		executeFunction: function (name, params) {
			var queryString = queryProvider.getQuery(name, params);
			return this.executeQuery(queryString);
		},
		executeQuery: function (sqlQuery, isDirect) {
			var deferred = Def.Deferred();
			try {
				if (this) {
					connection.connectionUtil.executeQuery.call(this, sqlQuery, isDirect).done(function (response) {

						deferred.resolve(response);

					}).fail(function (err) {
						deferred.reject(error.executeQueryError(err));
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
			connection.connectionUtil.releaseConnectiontoPool.call(this);
		},
		closeConnection: function () {
			connection.connectionUtil.closeConnection.call(this);
		}
	}
	var transactionsUtil = {
		begintransaction: function () {
			try {
				var deferred = Def.Deferred();
				if (this) {
					connection.transactionsUtil.begintransaction.call(this, function (err) {
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
			connection.transactionsUtil.committransaction.call(this, function (err) {
				if (err) {
					this.rollbacktransaction().done(function () {
						deferred.reject(error.commitError(err));
					});
				}
				deferred.resolve(true);
			});

			return deferred.promise();
		},
		rollbacktransaction: function () {
			var deferred = Def.Deferred();
			if (this) {
				connection.transactionsUtil.rollbacktransaction.call(this, function () {
					deferred.resolve(true);
				});
			}
			return deferred.promise();
		}
	}
	return {
		pool: pool,
		poolUtil: poolUtil,
		connectionUtil: connectionUtil,
		transactionsUtil: transactionsUtil,
		queryProvider: queryProvider
	};
}


module.exports = constructor;