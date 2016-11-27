/// <reference path="resouceManagerDataservice.js" />
var fs = require('fs');
var Def = require("jquery-deferred");
var store = require('../../common/store.js');
var schema = require('../../common/schema.js');
var utility = require('../../common/utility.js');
var dataservice = require('../../common/dataservice.js');
var rmDataservice = require('./resouceManagerDataservice.js');
var extend = require('extend');
var Def = require("jquery-deferred");
//var resouceManagerModel = require('./models/base.js');

var handler = {
	fetchPreviousState: function (inObject, outObject, platformObject) {
		var deferred = Def.Deferred();
		var currentSchemaObject = platformObject.getSchemaObject();
		if (currentSchemaObject.GetPreviousStateAPIID) {
			var schemaObjectOfPreviousStateAPI = schema.getSchemaMethodByObjectID(currentSchemaObject.GetPreviousStateAPIID);
			var newPlatformObject = utility.solvePlatformForNewProcess(platformObject, schemaObjectOfPreviousStateAPI);
			processor.process(inObject, {}, newPlatformObject).done(function (results) {
				deferred.resolve(results.outObject);
			}).fail(function (err) {
				deferred.reject(err);
			});
		}
		else
			deferred.resolve(undefined);

		return deferred.promise();
	},
	addRequest: function (inObject, outObject, platformObject, previousStateData) {
		var currentSchemaObject = platformObject.getSchemaObject();
		var v_APIID = currentSchemaObject.APIID || schema.getAPIID(currentSchemaObject);
		var v_GlobalTransactionID = platformObject.session.getGlobalTransactionID();
		var v_ClientRequestID = platformObject.session.getClientRequestID();
		var v_PreviousState = previousStateData;
		var v_NestingLevel = platformObject.getNestingLevel();
		var v_RequestData = inObject;
		var v_AdminID;
		return dataservice.addRequest(v_APIID, v_GlobalTransactionID, v_ClientRequestID, v_PreviousState, v_NestingLevel, v_RequestData, v_AdminID);
	}
	
};

module.exports = handler;