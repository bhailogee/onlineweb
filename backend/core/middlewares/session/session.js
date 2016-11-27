var paramsUtility = require('../../models/schema/paramsUtility');
var platformClass = require('../../models/platform/platform.js');
var extend = require('extend');
var Def = require("jquery-deferred");
var store = require("../../common/store.js");
var utility = require('../../common/utility.js');

var platfromSessionModelFunctions = function (plat) {
	

	var self = {
		setTXID: function (TXID) {
			this.setSession("TXID",TXID);
		},
		getTXID: function () {
			return this.getSession("TXID");
		},
		setClientRequestID: function (clientRequestID) {
			this.setSession("clientRequestID", clientRequestID);
		},
		getClientRequestID: function () {
			return this.getSession("clientRequestID");
		},
		getGlobalTransactionID: function () {
			return this.getSession("GlobalTransactionID");
		},
		resetGlobalTransactionID: function () {
			this.setSession("GlobalTransactionID", null);
		},
		setGlobalTransactionID: function (transactionID) {
			this.setSession("GlobalTransactionID",transactionID);
		},
		isSessionRequiredForIn: function () {
			var p = plat.schema.getInParams();
			for (var i = 0; i < p.length; i++) {
				if (paramsUtility.getServerParamProperty(p[i])) {
					if (this.getSessionToBeCreated()) {
						return false;
					}
					return true;
				}
			}
			return false;
		},
		isSessionRequiredForOut: function () {
			var p = plat.schema.getOutParams();
			for (var i = 0; i < p.length; i++) {
				if (paramsUtility.getServerParamProperty(p[i])) {
					return true;
				}
			}
			return false;
		},
		getSessionToBeCreated: function () {
			var s = plat.schema.getSchemaObject();
			return s.CreateSession || false;
		},
		loadSession: function (sessionKey) {
			this.sessionState = store.fetch(null, sessionKey);
			return this.sessionState;
		},
		sessionTouch: function () {
			this.setSession("LastTouched", Date.now());
		},
		setSessionTouched: function (key, value) {
			this.sessionTouch();
			this.setSession(key, value);
		},
		setSession: function (key, value) {
			store.save(key, value, plat.getKey());
		},
		getSession: function (key) {
			return store.fetch(key, plat.getKey());
		},
		createSession: function () {
			this.setSession("CreatedTime", Date.now());
			this.sessionTouch();
		},
		setServerParam: function (key, value) {
			return this.setSession("_serv_" + key, value);
		},
		getServerParam: function (key) {
			if (key.indexOf("sessionState.") > -1) {
				return this.getSession("_serv_" + key);
			}
			else if (key.indexOf("nodeState.") > -1) {
				var nodeState = plat.node.getHeader();
				return nodeState[key.split('.')[1]];
			}
			else if (key.indexOf("clientState.") > -1) {
				var clientState = plat.client.getHeader();
				return clientState[key.split('.')[1]];
			}
		},
		expireSession: function () {
			store.remove(null, plat.getKey());
		}
	};
	return self;
}

function session(inObject, outObject, platformObject) {
	platformObject.session = extend(true, platformObject.session, platfromSessionModelFunctions(platformObject));

	var def = Def.Deferred();
	var params = platformObject.schema.getParamsWithServerProperty(platformObject.schema.getInParams());
	if (params.length > 0) {
		console.log("[debug] Session Required");
		var sessionObject = platformObject.session.loadSession(platformObject.getKey());
		if (!sessionObject) {
			for (var i = 0; i < params.length; i++) {
				var serverParam = platformObject.schema.getServerParamProperty(params[i]);
				if (serverParam.indexOf("sessionState.") > -1) {
					platformObject.next = false;
					def.reject("Not Authorised");
					return;
				}
			}
		}
		console.log("[debug] Session found");
		for (var i = 0; i < params.length; i++) {
			inObject[paramsUtility.getParamName(params[i])] = platformObject.session.getServerParam(platformObject.schema.getServerParamProperty(params[i]));
		}
		console.log("[debug] Inobject Populated using Session");
		def.resolve(outObject);

	} else {
		def.resolve(outObject);
	}
	return def;
}

session.postprocess = function (inObject, outObject, platformObject) {
	if (platformObject.session.getSessionToBeCreated()) {
		platformObject.setKey();
		platformObject.session.createSession();
	}

	var def = Def.Deferred();
	if (platformObject.session.isSessionRequiredForOut() && platformObject.getKey()) {
		if (platformObject.schema.getSubjectIDField()) {
			platformObject.setSubjectID(outObject[platformObject.schema.getSubjectIDField()]);
		}
		
		var sessionObject = platformObject.session.loadSession(platformObject.getKey());
		if (!sessionObject) {
			platformObject.next = false;
			def.reject("Not Authorised");
		}
		else {
			var params = platformObject.schema.getParamsWithServerProperty(platformObject.schema.getOutParams());
			for (var i = 0; i < params.length; i++) {
				var p = params[i];
				var serverProp = paramsUtility.getServerParamProperty(p);
				platformObject.session.setServerParam(serverProp, outObject[paramsUtility.getParamName(p)]);
				outObject[paramsUtility.getParamName(p)] = null;
				delete outObject[paramsUtility.getParamName(p)];
			} 
			def.resolve(outObject);
		}
	} else {
		def.resolve(outObject);
	}
	return def;
}



module.exports = session;