var mappLibrary = require('object-mapper');

module.exports = function (inObject, out, mapp) {
	if (mapp) {
		return mappLibrary(inObject, out ,mapp);
	}
	else {
		return inObject;
	}
}