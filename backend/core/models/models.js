var fs = require('fs');

var modelsconfig = JSON.parse(fs.readFileSync('./core/models/modelsConfig.json', 'utf8'));
modelsconfig = (modelsconfig ? (modelsconfig.models || {}) : {});
//modelsconfig.base = modelsconfig.base || {
//	"lifetime": "transient",// "transient" or "persistant" etc
//	"path": "./base/base.js"
//};

var models = {};

var Class = {
	cons: function () {
		for (modelName in modelsconfig) {
			if (modelsconfig.hasOwnProperty(modelName)) {
				models[modelName] = Class.createModelClass(modelsconfig[modelName]);
			}
		}
		return models;
	},
	createModelClass: function (modelconfig) {
		var model = require(modelconfig.path);

		// modelconfig.lifetime possible values are ["transient","persistant"]
		switch (modelconfig.lifetime) {
			default:
				break;
		}
		return model;
	}

};
module.exports = Class.cons();




