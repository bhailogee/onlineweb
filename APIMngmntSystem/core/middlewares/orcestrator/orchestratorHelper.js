var utility = require('utility');
function genHelperFunction(inObject, outObject, platformObject) {
	var helper = {
		Transaction: {
			begin: function () {
				return helper.executeAPI("Transaction.BeginTrans", inObject);
			},
			commit: function () { },
			rollback: function () { }
		},
		executeAPI: function (apiID, apiInObject, _platformObject) {
			_platformObject = _platformObject || platformObject;
			apiInObject = apiInObject || inObject;
			return utility.resolveNewAPIProcess(apiID, apiInObject, _platformObject).then(function (result) {
				
				platformObject = result.platformObject;
				return result.outObject;
		});
		},
		getOrcestratorObject: function () {

			return platformObject.getOrcestratorObject();
		},
		getPlatformObject: function () {

			return platformObject;
		}

	}
}