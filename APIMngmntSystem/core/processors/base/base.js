
var deferred = require("jquery-deferred");
var middlerwaresManager = require('../../middlewares/middlewares.js');
var middlerwares = middlerwaresManager.layers;

var baseProcessor = {
	process: function (inObject, outObject, platformObject) {
		var _def = deferred.Deferred();		
		outObject = outObject || {};
		platformObject = platformObject || {};
		platformObject.next = true;
		platformObject.incrementNestingLevel();
		var layerCount = 0;
		this.processAll(inObject, outObject, platformObject, layerCount).done(function (result) {
			_def.resolve({ result: result, platformObject: platformObject });
		})
		.fail(function (err) {
			try {
				if (JSON.parse(err)) {
					err.ApplicationName = platformObject.schema.getApplicationName();
					err.APIName = platformObject.schema.getAPIName();
				}
				else {
					err += " ApplicationName: " + platformObject.schema.getApplicationName() + ", API Name:" + platformObject.schema.getAPIName();
				}
			} catch (ex)
			{
				err += " ApplicationName: " + platformObject.schema.getApplicationName() + ", API Name:" + platformObject.schema.getAPIName();
			}
			_def.reject(err);
		});
		return _def.promise();
	},
	processAll: function (inObject, outObject, platformObject, layerCount) {
		var layerDone;
		var _def = deferred.Deferred();
		if (middlerwares.length > 0 && layerCount < middlerwares.length && platformObject.next) {
			
			layerDone = this.processOne(inObject, outObject, platformObject, middlerwares[layerCount]);
			layerDone.done(function (outObject) {
				
				if (layerCount + 1 < middlerwares.length && platformObject.next) {
					baseProcessor.processAll(inObject, outObject, platformObject, ++layerCount).done(function (result) {
						_def.resolve(result);
					}).fail(function (err) {
						_def.reject(err);
					});
				}
				else {
					baseProcessor.postProcessAll(inObject, outObject, platformObject, layerCount).done(function (result) {
						_def.resolve(result);
					}).fail(function (err) {
						_def.reject(err);
					});
				}
			})
			.fail(function (err) {
				_def.reject(err);
			})
		}
		else {
			_def.resolve(outObject);
		}
		return _def.promise();
	},
	processOne: function (inObject, outObject, platformObject, middlerware) {
		console.log(middlerware.name + " middleware starts");
		var _def = deferred.Deferred();		
		try {
			var returnObject = middlerware(inObject, outObject, platformObject);
			if (returnObject) {
				if (returnObject.done) {
					returnObject.done(function (result) {
						console.log(middlerware.name + " middleware ends success.");
						_def.resolve(result);
					});
					returnObject.fail(function (err) {
						console.error(middlerware.name + " middleware ends error.");
						_def.reject(err);
					});
				}
				else {
					console.log(middlerware.name + " middleware ends success.");
					_def.resolve(returnObject);  //returnObject replaced with outObject
				}
			}
			else {
				console.log(middlerware.name + " middleware ends success.");
				_def.resolve(outObject);
			}
			
		} catch (e) {
			console.error(middlerware.name + " middleware ends error." + e.toString());
			_def.reject(e);
		}
		return _def;		
	},
	postProcessAll: function (inObject, outObject, platformObject, layerCount) {
		var _def = deferred.Deferred();
		var layerDone;
		if (middlerwares.length > 0 && layerCount >= 0 && layerCount < middlerwares.length) {
			layerDone = this.processOnePost(inObject, outObject, platformObject, middlerwares[layerCount--]);
			layerDone.done(function (outObject) {
				baseProcessor.postProcessAll(inObject, outObject, platformObject, layerCount).done(function (result) {
					_def.resolve(result);
				}).fail(function (err) {
					_def.reject(err);
				});
			})
			.fail(function (err) {
				_def.reject(err);
			});
		}
		else {
			_def.resolve(outObject);
		}
		return _def.promise();		
	},
	processOnePost: function (inObject, outObject, platformObject, middlerware) {
		var _def = deferred.Deferred();
		console.log(middlerware.name + " post middleware starts");
		if (middlerware.postprocess && typeof (middlerware.postprocess) == "function") {
			try {
				var returnObject = middlerware.postprocess(inObject, outObject, platformObject);
				if (returnObject) {
					if (returnObject.done) {
						returnObject.done(function (result) {
							console.log(middlerware.name + " post middleware ends success.");
							_def.resolve(result);
						});
						returnObject.fail(function (err) {
							console.error(middlerware.name + " post middleware ends error."+err);
							_def.reject(err);
						});
					}
					else {
						console.log(middlerware.name + " post middleware ends success.");
						_def.resolve(returnObject);  //returnObject replaced with outObject
					}
				} else {
					console.log(middlerware.name + " post middleware ends success.");
					_def.resolve(outObject);
				}
			} catch (e) {
				console.error(middlerware.name + " post middleware ends error." + e);
				_def.reject(e);
			}
		}
		else {
			console.error(middlerware.name + " post middleware ends success.");
			_def.resolve(outObject);
		}
		return _def;
	}
}


var Class = {
	cons: function () {
		return baseProcessor;
	}
};

module.exports = Class.cons();