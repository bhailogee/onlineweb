var utility = require('../../../common/utility.js');
var store = require('../../../common/store.js');
var extend = require('extend');

var baseFunctions = {
	getLinkedConnection: function () {
	},
	setKey: function () {
		this.key = utility.getUniqueID();
	},
	getKey: function () {
		return this.key;
	},	
	saveInStore: function () {
		store.save(this.getKey(), JSON.stringify(this));
	},
	attachWithApplication: function (applicationName) {
		this.applicationsInTransaction = this.applicationsInTransaction || [];
		if (this.applicationsInTransaction.indexOf(applicationName) == -1) {
			this.applicationsInTransaction.push(applicationName);
		}
	}
};

var base = {
	create: function () {
		var model = base.createnew();
		model = extend(true, model, baseFunctions);
		return model;
	},
	createnew: function () {
		var baseModel = {
		}
		return baseModel;
	}
}

base.create.load = function (key) {
	var storeObject = store.fetch(key);
	if (storeObject) {
		var st_ = JSON.parse(storeObject);
		st_ = extend(true, st_, baseFunctions);
		return _st;
	}
	else {
		return null;
	}
}
base.create.baseFunctions = baseFunctions;
var Class = {
	cons: function () {
		return base.create;
	}
}
module.exports = Class.cons();