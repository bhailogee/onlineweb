
var fs = require('fs');
var orcestratorConfig = JSON.parse(fs.readFileSync('./core/orcestrator/orcestratorConfig.json', 'utf8'));

var orcestratorHandler = require('./orcestratorHandler.js');
var OrcestratorError = require('./models/error.js');
var platformClass = require('../../models/platform/platform.js');
var extend = require('extend');
var workflows = {};

var platfromOrcestratorModelFunctions = {
	setOrcestratorObject: function (OrcestratorModel) {
		this.set(OrcestratorModel, "orcestrator");
	},
	getOrcestratorObject: function () {
		this.get("orcestrator");
	}
};
platformClass.baseFunctions = extend(true, platformClass.baseFunctions, platfromOrcestratorModelFunctions);

function orcestrator(inObject, outObject, platformObject) {

	var def = Def.Deferred();
	
	return def.promise();
}

var postprocess = function (inObject, outObject, platformObject) {

}
orcestratorConfig.workflows.every(function (item, i) {
	workflows[item] = require("../../../workflows/" + item + ".js");
	return true;
});
orcestrator.workflows = workflows;
var cons = {
	init: function () {
		orcestrator.postprocess = postprocess;
		return orcestrator;
	}
};

module.exports = cons.init();