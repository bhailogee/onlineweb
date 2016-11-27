var Def = require("jquery-deferred");
var resourceHandler = require('../resourceManager/resourceManagerHandler.js');
function resourcemanagercommands(inObject, outObject, platform) {

	var def = Def.Deferred();
	if (resourceHandler.isMyCommand(inObject, outObject, platform)) {
		console.log("[debug] Resource Manager found its command " + platform.schema.getAPIName());
		resourceHandler.executeMyCommand(inObject, outObject, platform).then(function (result) {
			platform.next = false;
			def.resolve({ inObject: inObject, outObject: result, platformObject: platform });
		});
	}
	else {
		def.resolve(inObject);
	}
	return def.promise();
}

function postprocess() { }

var cons = {
	init: function () {
		resourcemanagercommands.postprocess = postprocess;
		return resourcemanagercommands;
	}
};

module.exports = cons.init();