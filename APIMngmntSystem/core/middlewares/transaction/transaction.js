var extend = require('extend');
var platformClass = require('../../models/platform/platform.js');
var transactionHandler = require('./transactionHandler.js');
var platformClass = require('../../models/platform/platform.js');
var Def = require("jquery-deferred");

var platfromTransactionModelFunctions = {
	//setTransactionObject: function (transactionModel) {
	//	this.set(transactionModel, "transaction");
	//},
	//getTransactionObject: function () {
	//	this.get("transaction");
	//},
	
	//getTransactionConnection: function () {
	//	return this.transactionConnection;
	//},
	//setTransactionConnection: function (connection) {
	//	this.transactionConnection = connection;
	//}
};
platformClass.baseFunctions = extend(true, platformClass.baseFunctions, platfromTransactionModelFunctions);


function transaction(inObject, outObject, platformObject) {
	var def = Def.Deferred();
	if (transactionHandler.isMyCommands(inObject, outObject, platformObject)) {
		console.log("[debug] Transaction found" + platformObject.schema.getAPIName());
		transactionHandler.executeMyCommand(inObject, outObject, platformObject).then(function (result) {
			platformObject.next = false;
			def.resolve({ inObject: inObject, outObject: result, platformObject: platformObject });
		});
	}
	else {
		def.resolve({ inObject: inObject, outObject: outObject, platformObject: platformObject });
	}
	//else {
	//	transactionHandler.executeOnly(inObject, outObject, platformObject);
	//	return { inObject: inObject, outObject: outObject, platformObject: platformObject };
	//	//if (transactionHandler.inTransaction(inObject, outObject, platformObject)) {
	//	//	transactionHandler.executeInTransaction(inObject, outObject, platformObject);
	//	//}
	//	//else {
			
	//	//}
	//}
	return def.promise();
}

var postprocess = function (inObject, outObject, platformObject) {

}


var cons = {
	init: function () {
		transaction.postprocess = postprocess;
		transaction.handler = transactionHandler;
		return transaction;
	}
};

module.exports = cons.init();