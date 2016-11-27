/// <reference path="" />
var Def = require("jquery-deferred");
var dataservice = require('../../common/dataservice.js');

function content(inObject, outObject, platform) {


}

function postprocess(inObject, outObject, platformObject) {
	var def = Def.Deferred();
	try {
		if (outObject && outObject.v_ReturnCode != null && outObject.v_ReturnCode != 0) {
			console.error("[debug] error Code : " + outObject.v_ReturnCode);
			dataservice.getReturnCodeDescription(platformObject.session.getServerParam("sessionState.v_LocaleData"), outObject.v_ReturnCode).done(function (results) {
				outObject.v_ReturnCodeDescription = results.v_ErrorDescription;
				console.error("[debug] error description:" + results.v_ErrorDescription);
				def.resolve(outObject);
			}).fail(function (err) {
				def.reject(err);
			});
		}
		else {
			def.resolve(outObject);
		}
	} catch (e) {
		def.reject(e)
	}
	return def;
}
var cons = {
	init: function () {
		content.postprocess = postprocess;
		return content;
	}
};

module.exports = cons.init();