var fs = require('fs');
var utility = require('../../../common/utility.js');
var store = require('../../../common/store.js');
var securityConfig = JSON.parse(fs.readFileSync('./core/middlewares/security/securityConfig.json', 'utf8'));


var baseFunctions = {
	touch: function () {
		this._lastTouched = new Date().getTime();
	},
	lastTouched: function () {
		return this._lastTouched;
	},
	setKey: function () {
		this.key = utility.getUniqueID();
	},
	getKey: function () {
		return this.key;
	},
	isValidated: function () {
		return this.valid;
	},
	isAuthenticated: function () {
		return this.authentic;
	},
	isAuthorized: function () {
		return this.authorize;
	},
	authorised: function (val) {
		this.authorize = val;
	},
	authenticated: function (val) {
		this.authentic= val;
	},
	validated: function (val) {
		this.valid = val;
	},
	saveInStore: function () {
		store.save(this.getKey(), JSON.stringify(this));
	},
	isExpired: function () {
		var timeDiff = new Date().getTime() - new Date(this.lastTouched()).getTime();
		return securityConfig.sessionExpireTime < timeDiff;
	},
	setAuthenticatedIDs: function (authenticatedIDs) {
		this.authenticatedIDs = authenticatedIDs;
	},
	getAuthenticatedIDs: function () {
		return this.authenticatedIDs;
	}
};

var base = {
	create: function () {
		var model = base.createnew();
		model = extend(true, model, baseFunctions);
		model.touch();
		model.setKey();
		return model;
	},
	createnew: function () {
		var baseModel = {
			validated: false,
			authenticated:false
		}
		return baseModel;
	}
}

base.create.load= function(key){
	var storeObject = store.fetch(key);
	if (storeObject) {
		var st_ = JSON.parse(storeObject);
		st_ = extend(true, st_, baseFunctions);
		st_.touch();
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