var iterator = {
	iteratorRunner: function (apiName, platformObject, outObject) {
		var processor = require("../core/processors/processors.js");
		var _def = deferred.Deferred();
		if (local.iteratorObjects.length > 0) {
			var platform = resolver.resolve(platformObject, "__Begin");
			processor.process({}, outObject, platform).done(function (result) {

				var iteratorPayLoad = local.iteratorObjects[0];
				platform = resolver.resolve(platformObject, apiName);

				processor.process(iteratorPayLoad, outObject, platform).done(function (result) {
					if (result.result.resultCode == "success") {
						local.iteratorObjects.shift();
						return internal.iteratorRunner(apiName, platform, result);
					}
					else {
						return _def.reject(result.result);
					}
				}).fail(function (err) {
					return _def.reject(result.result);
				});
			});
		} else {
			_def.resolve(outObject);
		}
		return _def;
	},
	iterator: function (inObject, outObject, platformObject) {
		if (inObject["rowsPerTransaction"]) {

		}
		else {
			var _def = deferred.Deferred();

			var apiName = inObject["apiName"];
			local.iteratorObjects = inObject["payLoad"];
			var rowsPerTransaction = inObject["rowsPerTransaction"];

			if (local.iteratorObjects.length > 0) {
				var platformStart = resolver.resolve(platformObject, "__Begin");
				processor.process({}, outObject, platformStart).done(function (resultStart) {
					//platform.getGlobalTransactionID();
					var iteratorPlatformObject = resolver.resolve(platformStart, apiName);
					internal.iteratorRunner(apiName, iteratorPlatformObject).done(function (result) {

						if (result.resultCode == "success") {
							var platformCommit = resolver.resolve(iteratorPlatformObject, "__Commit");
							processor.process({}, outObject, platformCommit).done(function (commitResult) {
								_def.resolve(result);
							});
						}
						else {
							var platformRollback = resolver.resolve(iteratorPlatformObject, "__Rollback");
							processor.process({}, outObject, platformRollback).done(function (rollbackResult) {
								_def.resolve(result);
							});
						}
					});
				});
			}
			//return internal.iteratorRunner(apiName, platformObject);

			return _def;
		}
	}

};


module.exports = iterator;