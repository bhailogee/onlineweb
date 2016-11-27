var container = {};
var namespaces = {};
var store = {	
	save: function (key, value, namespace) {
		var a = container;
		if (namespace) {
			if (!namespaces[namespace]) {
				namespaces[namespace] = {};
			}
			a = namespaces[namespace];
		}
		a[key] = value;
	},
	fetch: function (key,namespace) {
		var a = container;
		if (namespace) {
			if (!namespaces[namespace]) {
				return undefined;
			}
			a = namespaces[namespace];
		}
		if (key !== undefined && key !== null) {
			return a[key];
		}
		else {
			return a;
		}
		
	},
	remove: function (key, namespace) {
		var a = container;
		if (namespaces[namespace]) {
			if (key !== undefined && key !== null) {
				namespaces[namespace][key] = null;
				delete namespaces[namespace][key];
			}
			else {
				namespaces[namespace] = null;
				delete namespaces[namespace];
			}
		} else {
			if (key !== undefined && key !== null) {
				container[key] = null;
				delete container[key];
			}
			else {
				//nothing
			}
		}
	}
};
module.exports = store;