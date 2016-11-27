//"active": [ "session", "authorization", "content", "transaction", "resourcemanager", "gateway" ],

var fs = require('fs');
var middlewareConfig = JSON.parse(fs.readFileSync('./core/middlewares/middlerwaresConfig.json', 'utf8'));
var middlerwares = {
	layers: [],
	loadedLayers: [],
};

function activateMiddlerwares() {

	if (middlewareConfig.active && middlewareConfig.active.length > 0) {
		for (var i = 0; i < middlewareConfig.active.length; i++) {
			var name = middlewareConfig.active[i];
			var middlewarelayer = initmiddleware(name);			
			if (middlewarelayer) {
				middlewarelayer._layerName = name;
				middlerwares.layers.push(middlewarelayer);
				middlerwares.loadedLayers.push(name);
			}
		}
	}
}

function initmiddleware(name) {
	if (middlewareConfig.middlerwares && middlewareConfig.middlerwares[name]) {
		var confObj = middlewareConfig.middlerwares[name];
		var m = require("./"+name + "/" + (confObj.path || confObj.defaultPath || (name + ".js")));
		if (m) {
			return m;
		}
		else {
			return null;
		}
	}
	else { return undefined; }
}

var Class = {
	cons: function () {
		activateMiddlerwares();
		return middlerwares;
	}
};

module.exports = Class.cons();