var dataservice = require('../../common/dataservice.js');


var transactionDataservice = {
	startGlobalTransaction: function (inObject, outObject, platformObject) {
		return dataservice.executeByAPI("TX_StartGlobalTransaction", [platformObject.session.getClientRequestID(), platformObject.session.getServerParam("sessionState.v_AdministratorID")], ["v_GlobalTransactionID", "v_ReturnCode"]);
	},
	endGlobalTransaction: function (inObject, outObject, platformObject) {
		return dataservice.executeByAPI("TX_EndGlobalTransaction", [platformObject.session.getGlobalTransactionID(), "commit", platformObject.session.getServerParam("sessionState.v_AdministratorID")], ["v_ReturnCode"]);
	},
	rollbackGlobalTransaction: function (inObject, outObject, platformObject) {
		return dataservice.executeByAPI("TX_EndGlobalTransaction", [platformObject.session.getGlobalTransactionID(), "rollback", platformObject.session.getServerParam("sessionState.v_AdministratorID")], ["v_ReturnCode"]);
	}
};

module.exports = transactionDataservice;

